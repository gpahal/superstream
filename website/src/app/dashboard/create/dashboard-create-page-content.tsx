'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { BN, web3 } from '@coral-xyz/anchor'
import { zodResolver } from '@hookform/resolvers/zod'
import { BN_TWO, BN_ZERO, MAX_STREAM_NAME_LENGTH, type SuperstreamClient } from '@superstream/client'
import { addDays, addHours } from 'date-fns'
import { CheckIcon } from 'lucide-react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

import {
  findTimePeriod,
  formatDurationMillis,
  formatTimeFromMillis,
  parseTimePeriodCount,
  TIME_PERIODS,
} from '@/lib/date'
import { getClusterDisplayName, useCluster } from '@/lib/solana/cluster'
import {
  convertTimeInMillisToBnSecs,
  formatDurationFromBnSeconds,
  getCurrentTimeInBn,
  parseCountAndTimePeriodToBnSeconds,
} from '@/lib/solana/date'
import { getAnchorErrorMessage } from '@/lib/solana/error'
import { useStreamsContext } from '@/lib/solana/streams'
import { useSuperstreamClient } from '@/lib/solana/superstream'
import { useTokenAccountsContext, type TokenAccountDetails } from '@/lib/solana/token-accounts'
import { formatTokenAmount, parseTokenAmount } from '@/lib/solana/tokens'
import { shortenPublicKey, useWalletContext } from '@/lib/solana/wallet'
import { zPublicKey, zTokenAmount } from '@/lib/solana/zod'
import { cn } from '@/lib/styles'
import { zStringRequired, zTimePeriod, zTimePeriodCount } from '@/lib/zod'
import { useCurrentTime } from '@/hooks/use-current-time'
import { Button } from '@/components/lib/button'
import { Checkbox, type CheckedState } from '@/components/lib/checkbox'
import { DateTimeInput } from '@/components/lib/date-time-input'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProvider,
} from '@/components/lib/form'
import { H2 } from '@/components/lib/heading'
import { Input } from '@/components/lib/input'
import { Link } from '@/components/lib/link'
import { RadioGroup, RadioGroupItem } from '@/components/lib/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/lib/select'
import { Spinner } from '@/components/lib/spinner'
import { useToastContext } from '@/components/lib/toast'

export default function DashboardCreatePageContent() {
  const superstreamClient = useSuperstreamClient()

  return superstreamClient ? (
    <CreateStreamForm superstreamClient={superstreamClient} />
  ) : (
    <div className="mt-10 flex w-full flex-col items-center justify-center">
      <Spinner />
    </div>
  )
}

function createCreateStreamFormDataSchema({
  superstreamClient,
  walletPublicKey,
  tokenAccounts,
}: {
  superstreamClient?: SuperstreamClient
  walletPublicKey?: web3.PublicKey
  tokenAccounts: TokenAccountDetails[]
}) {
  return z
    .object({
      type: z.enum(['prepaid', 'non-prepaid'], {
        required_error: 'Type of stream is required',
        invalid_type_error: 'Type of stream should be either prepaid or topup when needed',
      }),
      name: zStringRequired('Stream name').refine(
        (s) => s.length <= MAX_STREAM_NAME_LENGTH,
        `Stream name cannot be longer than ${MAX_STREAM_NAME_LENGTH} characters`,
      ),
      recipient: zPublicKey(
        zStringRequired('Recipient'),
        'Recipient',
        (recipient) => !walletPublicKey || !recipient.equals(walletPublicKey),
        'Sender and recipient cannot be the same',
      ),
      startTime: z
        .number()
        .refine((st) => !st || st <= 0 || st >= Date.now(), 'Start time should be greater than current time'),
      endTime: z.number(),
      token: zPublicKey(zStringRequired('Token'), 'Token'),
      initialAmount: zTokenAmount(z.string(), 'Payment amont'),
      flowIntervalCount: zTimePeriodCount(z.string(), 'Payment interval count'),
      flowIntervalTimePeriod: zTimePeriod(z.string(), 'Payment interval period'),
      flowRate: zTokenAmount(z.string(), 'Payment amount per interval'),
      topupAmount: zTokenAmount(z.string(), 'Deposit amount'),
      senderCanCancel: z.boolean(),
      senderCanChangeSender: z.boolean(),
      senderCanPause: z.boolean(),
    })
    .superRefine(
      (
        {
          type,
          startTime,
          endTime,
          token,
          initialAmount,
          flowIntervalCount,
          flowIntervalTimePeriod,
          flowRate,
          topupAmount,
        },
        ctx,
      ) => {
        const isPrepaid = type === 'prepaid'

        const tokenAccount = tokenAccounts.find((tad) => tad.data.mint.toString() === token)
        const tokenInfo = tokenAccount?.tokenInfo

        const parsedStartTime = startTime == null || startTime <= 0 ? 0 : startTime
        const parsedEndTime = endTime == null || endTime <= 0 ? 0 : endTime
        const parsedInitialAmount = initialAmount ? parseTokenAmount(initialAmount, tokenInfo)! : BN_ZERO
        const parsedFlowInterval =
          flowIntervalCount && flowIntervalTimePeriod
            ? parseCountAndTimePeriodToBnSeconds(
                parseTimePeriodCount(flowIntervalCount)!,
                findTimePeriod(flowIntervalTimePeriod)!,
              )
            : BN_ZERO
        const parsedFlowRate = flowRate ? parseTokenAmount(flowRate, tokenInfo)! : BN_ZERO
        const parsedTopupAmount = topupAmount ? parseTokenAmount(topupAmount, tokenInfo)! : BN_ZERO

        if ((isPrepaid || parsedEndTime > 0) && parsedEndTime > 0 && parsedEndTime <= Date.now()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'End time should be greater than current time',
            path: ['endTime'],
          })
        }
        if (parsedStartTime > 0 && parsedEndTime > 0 && parsedEndTime < parsedStartTime) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'End time should be greater than or equal to start time',
            path: ['endTime'],
          })
        }
        if (parsedInitialAmount.lte(BN_ZERO)) {
          if (parsedFlowInterval.lte(BN_ZERO)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Cannot create a zero value stream. Payment interval duration should be > 0',
              path: ['flowIntervalCount'],
            })
          }
          if (parsedFlowRate.lte(BN_ZERO)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Cannot create a zero value stream. Payment amount at start and per interval cannot both be 0',
              path: ['flowRate'],
            })
          }
          if (parsedStartTime > 0 && parsedEndTime > 0 && parsedEndTime === parsedStartTime) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'End time should be greater than start time',
              path: ['endTime'],
            })
          }
        }
        if (!isPrepaid) {
          if (parsedFlowInterval.lte(BN_ZERO)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Payment interval duration should be > 0',
              path: ['flowIntervalCount'],
            })
          } else if (superstreamClient) {
            const at = getCurrentTimeInBn()
            const depositNeeded = superstreamClient
              .getNonPrepaidDepositNeeded(at, {
                startsAt: parsedStartTime <= 0 ? BN_ZERO : new BN(parsedStartTime),
                endsAt: parsedEndTime <= 0 ? BN_ZERO : new BN(parsedEndTime),
                flowInterval: parsedFlowInterval,
                flowRate: parsedFlowRate,
              })
              .mul(BN_TWO)
            if (depositNeeded.gt(BN_ZERO)) {
              const topupNeeded = depositNeeded.add(parsedInitialAmount)
              if (parsedTopupAmount.lt(topupNeeded)) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: `Initial deposit amount should be >= minimum deposit needed (${formatTokenAmount(
                    topupNeeded,
                    tokenInfo,
                  )})`,
                  path: ['topupAmount'],
                })
              }
            } else if (parsedTopupAmount.gt(BN_ZERO)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Topup amount should be 0 when there is no deposit needed',
                path: ['topupAmount'],
              })
            }
          }
        }
      },
    )
}

type CreateStreamFormData = z.infer<ReturnType<typeof createCreateStreamFormDataSchema>>

type CreateStreamData = {
  isPrepaid: boolean
  name: string
  recipient: web3.PublicKey
  startTime: BN
  endTime: BN
  token: web3.PublicKey
  initialAmount: BN
  flowInterval: BN
  flowRate: BN
  topupAmount: BN
  senderCanCancel: boolean
  senderCanChangeSender: boolean
  senderCanPause: boolean
}

function getCreateStreamData(
  {
    type,
    name,
    recipient,
    startTime,
    endTime,
    token,
    initialAmount,
    flowIntervalCount,
    flowIntervalTimePeriod,
    flowRate,
    topupAmount,
    senderCanCancel,
    senderCanChangeSender,
    senderCanPause,
  }: CreateStreamFormData,
  {
    tokenAccounts,
  }: {
    tokenAccounts: TokenAccountDetails[]
  },
): CreateStreamData {
  const isPrepaid = type === 'prepaid'

  const tokenAccountDetails = tokenAccounts.find((tad) => tad.data.mint.toString() === token)
  const tokenInfo = tokenAccountDetails?.tokenInfo

  const parsedName = name.trim()
  const parsedRecipient = new web3.PublicKey(recipient)
  const parsedStartTime = startTime == null || startTime <= 0 ? BN_ZERO : convertTimeInMillisToBnSecs(startTime)
  const parsedEndTime = endTime == null || endTime <= 0 ? BN_ZERO : convertTimeInMillisToBnSecs(endTime)
  const parsedToken = new web3.PublicKey(token)
  const parsedInitialAmount = initialAmount ? parseTokenAmount(initialAmount, tokenInfo)! : BN_ZERO
  const parsedFlowInterval =
    flowIntervalCount && flowIntervalTimePeriod
      ? parseCountAndTimePeriodToBnSeconds(
          parseTimePeriodCount(flowIntervalCount)!,
          findTimePeriod(flowIntervalTimePeriod)!,
        )
      : BN_ZERO
  const parsedFlowRate = flowRate ? parseTokenAmount(flowRate, tokenInfo)! : BN_ZERO
  const parsedTopupAmount = topupAmount ? parseTokenAmount(topupAmount, tokenInfo)! : BN_ZERO
  const parsedSenderCanCancel = senderCanCancel === true
  const parsedSenderCanChangeSender = senderCanChangeSender === true
  const parsedSenderCanPause = senderCanPause === true

  return {
    isPrepaid,
    name: parsedName,
    recipient: parsedRecipient,
    startTime: parsedStartTime,
    endTime: parsedEndTime,
    token: parsedToken,
    initialAmount: parsedInitialAmount,
    flowInterval: parsedFlowInterval,
    flowRate: parsedFlowRate,
    topupAmount: parsedTopupAmount,
    senderCanCancel: parsedSenderCanCancel,
    senderCanChangeSender: parsedSenderCanChangeSender,
    senderCanPause: parsedSenderCanPause,
  }
}

type CreateStreamFormProps = {
  superstreamClient: SuperstreamClient
}

function CreateStreamForm({ superstreamClient }: CreateStreamFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { addToast } = useToastContext()

  const at = useCurrentTime()
  const cluster = useCluster()
  const { wallet } = useWalletContext()
  const { tokenAccounts } = useTokenAccountsContext()
  const { refresh: refreshStreams } = useStreamsContext()

  const form = useForm<CreateStreamFormData>({
    resolver: zodResolver(
      createCreateStreamFormDataSchema({ superstreamClient, walletPublicKey: wallet?.publicKey, tokenAccounts }),
    ),
    defaultValues: {
      type: 'prepaid',
      name: '',
      recipient: '',
      startTime: 0,
      endTime: addDays(at, 1).getTime(),
      token: tokenAccounts.length > 0 ? tokenAccounts[0]!.data.mint.toString() : '',
      initialAmount: '',
      flowIntervalCount: '',
      flowIntervalTimePeriod: TIME_PERIODS[0]!.value,
      flowRate: '',
      topupAmount: '',
      senderCanCancel: true,
      senderCanChangeSender: false,
      senderCanPause: false,
    },
  })

  const handleSubmit = form.handleSubmit(async (formData: CreateStreamFormData) => {
    const data = getCreateStreamData(formData, { tokenAccounts })
    const params = {
      mint: data.token,
      recipient: data.recipient,
      name: data.name,
      startsAt: data.startTime,
      endsAt: data.endTime,
      initialAmount: data.initialAmount,
      flowInterval: data.flowInterval,
      flowRate: data.flowRate,
      senderCanCancel: data.senderCanCancel,
      senderCanCancelAt: BN_ZERO,
      senderCanChangeSender: data.senderCanChangeSender,
      senderCanChangeSenderAt: BN_ZERO,
      senderCanPause: data.senderCanPause,
      senderCanPauseAt: BN_ZERO,
      recipientCanResumePauseBySender: false,
      recipientCanResumePauseBySenderAt: BN_ZERO,
      anyoneCanWithdrawForRecipient: true,
      anyoneCanWithdrawForRecipientAt: BN_ZERO,
    }

    console.info(`Create stream with params: ${JSON.stringify(params)}`)

    let streamPublicKey: web3.PublicKey | undefined
    try {
      if (data.isPrepaid) {
        const stream = await superstreamClient.createPrepaidStream(params)
        streamPublicKey = stream.publicKey
      } else {
        const stream = await superstreamClient.createNonPrepaidStream({
          ...params,
          topupAmount: data.topupAmount.gt(BN_ZERO) ? data.topupAmount : data.initialAmount,
        })
        streamPublicKey = stream.publicKey
      }
    } catch (e) {
      console.error(e)
      addToast({ variant: 'error', title: getAnchorErrorMessage(e) })
      return
    }

    const pathname = '/dashboard'
    const newSearchParams = new URLSearchParams(searchParams.toString())
    if (streamPublicKey) {
      newSearchParams.set('selected_stream', streamPublicKey.toString())
    }
    const search = newSearchParams.toString()
    const query = search ? `?${search}` : ''
    router.push(`${pathname}${query}`)
    await refreshStreams()
  })

  if (!wallet || !tokenAccounts || tokenAccounts.length === 0) {
    return (
      <div className="mx-auto mt-10 flex w-full max-w-4xl flex-col items-center">
        <h3 className="text-xl font-semibold">No tokens found</h3>
        <div className="mt-1 text-center text-base text-fg-subtle">
          <p>{`There were no SPL tokens found on ${getClusterDisplayName(cluster)} for your ${
            wallet ? `${wallet.name} ` : ''
          }wallet${wallet ? ` (${shortenPublicKey(wallet.publicKey)})` : ''}`}</p>
          <p>Please ensure you have some tokens for stream creation and payment</p>
        </div>
      </div>
    )
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <CreateStreamFormInternal superstreamClient={superstreamClient} form={form} />
      </form>
    </FormProvider>
  )
}

type CreateStreamFormInternalProps = CreateStreamFormProps & {
  form: UseFormReturn<CreateStreamFormData>
}

function CreateStreamFormInternal({ superstreamClient, form }: CreateStreamFormInternalProps) {
  const at = useCurrentTime()
  const { tokenAccounts } = useTokenAccountsContext()

  const [isPrepaid, setIsPrepaid] = React.useState(true)
  const [tokenAccount, setTokenAccount] = React.useState(tokenAccounts[0])

  const setType = (type: string) => {
    const formData = form.getValues()
    if (type === 'prepaid') {
      if (!formData.endTime || formData.endTime <= 0) {
        form.setValue(
          'endTime',
          addDays(formData.startTime && formData.startTime > 0 ? formData.startTime : Date.now(), 1).getTime(),
        )
      }
      if (formData.senderCanChangeSender) {
        form.setValue('senderCanChangeSender', false)
      }
      if (formData.senderCanPause) {
        form.setValue('senderCanPause', false)
      }
    } else if (formData.endTime && formData.endTime > 0) {
      form.setValue('endTime', 0)
    }
    form.setValue('type', type === 'prepaid' ? 'prepaid' : 'non-prepaid')
    setIsPrepaid(type === 'prepaid')
    updateTimes()
  }

  const getStartTime = () => {
    const formData = form.getValues()
    return formData.startTime && formData.startTime > 0 ? formData.startTime : undefined
  }

  const getEndTime = () => {
    const formData = form.getValues()
    return formData.endTime && formData.endTime > 0 ? formData.endTime : undefined
  }

  const getDuration = () => {
    const formData = form.getValues()
    const startTime = formData.startTime
    const endTime = formData.endTime
    return endTime && endTime > 0
      ? (startTime && startTime > 0 && endTime && endTime <= startTime) ||
        ((!startTime || startTime <= 0) && endTime && endTime <= at)
        ? undefined
        : endTime - (startTime || at)
      : undefined
  }

  const [startTime, setStartTime] = React.useState<number | undefined>(getStartTime())
  const [endTime, setEndTime] = React.useState<number | undefined>(getEndTime())
  const [duration, setDuration] = React.useState<number | undefined>(getDuration())

  const updateTimes = () => {
    setStartTime(getStartTime())
    setEndTime(getEndTime())
    setDuration(getDuration())

    void form.trigger(['startTime', 'endTime'])
  }

  const getPaymentProperties = (): { flowInterval: BN; depositNeeded: BN; topupNeeded: BN } => {
    if (isPrepaid || superstreamClient == null) {
      return { flowInterval: BN_ZERO, depositNeeded: BN_ZERO, topupNeeded: BN_ZERO }
    }

    const formData = form.getValues()
    const flowIntervalCountLocal = parseTimePeriodCount(formData.flowIntervalCount || '0')
    if (!flowIntervalCountLocal || !formData.flowIntervalTimePeriod) {
      return { flowInterval: BN_ZERO, depositNeeded: BN_ZERO, topupNeeded: BN_ZERO }
    }

    const flowIntervalTimePeriodLocal = formData.flowIntervalTimePeriod
      ? findTimePeriod(formData.flowIntervalTimePeriod)
      : undefined
    if (!flowIntervalTimePeriodLocal) {
      return { flowInterval: BN_ZERO, depositNeeded: BN_ZERO, topupNeeded: BN_ZERO }
    }

    const flowInterval = parseCountAndTimePeriodToBnSeconds(flowIntervalCountLocal, flowIntervalTimePeriodLocal)
    const flowRateLocal = parseTokenAmount(formData.flowRate || '0', tokenAccount?.tokenInfo)
    if (!flowRateLocal) {
      return { flowInterval, depositNeeded: BN_ZERO, topupNeeded: BN_ZERO }
    }

    const startTime = formData.startTime
    const endTime = formData.endTime

    const depositNeeded = superstreamClient
      .getNonPrepaidDepositNeeded(convertTimeInMillisToBnSecs(at), {
        startsAt: !startTime || startTime <= 0 ? BN_ZERO : convertTimeInMillisToBnSecs(startTime),
        endsAt: !endTime || endTime <= 0 ? BN_ZERO : convertTimeInMillisToBnSecs(endTime),
        flowInterval: flowInterval,
        flowRate: flowRateLocal,
      })
      .mul(BN_TWO)

    const initialAmountLocal = parseTokenAmount(formData.initialAmount || '0', tokenAccount?.tokenInfo)
    const topupNeeded =
      initialAmountLocal && initialAmountLocal.gt(BN_ZERO) ? depositNeeded.add(initialAmountLocal) : depositNeeded
    return { flowInterval, depositNeeded, topupNeeded }
  }

  const [paymentProperties, setPaymentProperties] = React.useState(getPaymentProperties())

  const updatePaymentProperties = () => {
    setPaymentProperties(getPaymentProperties())

    void form.trigger(['initialAmount', 'flowIntervalCount', 'flowIntervalTimePeriod', 'flowRate', 'topupAmount'])
  }

  const setStartOnCreate = (startOnCreate: CheckedState) => {
    if (startOnCreate) {
      form.setValue('startTime', 0)
    } else {
      form.setValue('startTime', addHours(Date.now(), 1).getTime())
    }
    updateTimes()
    updatePaymentProperties()
  }

  const setHasNoEndTime = (hasNoEndTime: CheckedState) => {
    const formData = form.getValues()
    if (hasNoEndTime && formData.type === 'prepaid') {
      return
    }

    if (hasNoEndTime) {
      form.setValue('endTime', 0)
    } else {
      form.setValue(
        'endTime',
        addDays(formData.startTime && formData.startTime > 0 ? formData.startTime : Date.now(), 1).getTime(),
      )
    }
    updateTimes()
    updatePaymentProperties()
  }

  const setToken = (token: string) => {
    form.setValue('token', token)
    setTokenAccount(tokenAccounts.find((tad) => tad.data.mint.toString() === token))
    updatePaymentProperties()
  }

  const tokenCurrencyIndication = tokenAccount?.tokenInfo
    ? ` (in ${tokenAccount.tokenInfo.symbol})`
    : ' (of selected token)'

  return (
    <>
      <CreateStreamFormSection title="Basic information">
        <FormField
          control={form.control}
          name="type"
          render={({ field: { onChange: _, ...field } }) => (
            <FormItem className="col-span-6">
              <FormLabel>Stream type</FormLabel>
              <FormDescription>
                Read more about the types of streams{' '}
                <Link variant="highlighted" href="/docs/resources/types-of-streams">
                  here
                </Link>
              </FormDescription>
              <FormControl>
                <RadioGroup {...field} onValueChange={setType} className="mt-1 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormItem>
                    <FormControl>
                      <RadioGroupItem
                        variant="unstyled"
                        value="prepaid"
                        className={cn(
                          'relative flex h-full flex-row items-start rounded-lg bg-bg pb-3.5 pl-4 pr-10 pt-3 text-fg hover:bg-bg-emphasis',
                          isPrepaid ? 'border-2 border-info-9' : 'border',
                        )}
                      >
                        <FormLabel className="flex cursor-pointer flex-col items-start gap-1 text-left">
                          <span className="font-extramedium">Prepaid</span>
                          <span className="text-[0.9375rem]/[1.25rem] font-normal text-fg-subtle">
                            Pay total amount upfront and get refunded on stream cancellation
                          </span>
                        </FormLabel>
                        {isPrepaid && (
                          <div className="absolute right-4 top-[0.8rem] flex h-[1.125rem] w-[1.125rem] items-center justify-center rounded-full bg-info-9 text-fg">
                            <CheckIcon strokeWidth={3} className="mt-[0.05rem] h-3 w-3 text-info-fg" />
                          </div>
                        )}
                      </RadioGroupItem>
                    </FormControl>
                  </FormItem>

                  <FormItem>
                    <FormControl>
                      <RadioGroupItem
                        variant="unstyled"
                        value="non-prepaid"
                        className={cn(
                          'relative flex h-full flex-row items-start rounded-lg bg-bg pb-3.5 pl-4 pr-10 pt-3 text-fg hover:bg-bg-emphasis',
                          !isPrepaid ? 'border-2 border-info-9' : 'border',
                        )}
                      >
                        <FormLabel className="flex cursor-pointer flex-col items-start gap-1 text-left">
                          <span className="font-extramedium">Unbounded</span>
                          <span className="text-[0.9375rem]/[1.25rem] font-normal text-fg-subtle">
                            Pay a small deposit amount upfront and keep topping up the stream to keep it running
                          </span>
                        </FormLabel>
                        {!isPrepaid && (
                          <div className="absolute right-4 top-[0.8rem] flex h-[1.125rem] w-[1.125rem] items-center justify-center rounded-full bg-info-9 text-fg">
                            <CheckIcon strokeWidth={3} className="mt-[0.05rem] h-3 w-3 text-info-fg" />
                          </div>
                        )}
                      </RadioGroupItem>
                    </FormControl>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="col-span-6">
              <FormLabel>Name</FormLabel>
              <FormDescription>Choose a stream name that you can recognize later</FormDescription>
              <FormControl>
                <Input {...field} placeholder="Name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="recipient"
          render={({ field }) => (
            <FormItem className="col-span-6">
              <FormLabel>Recipient</FormLabel>
              <FormDescription>Address of the wallet that should receive the stream payments</FormDescription>
              <FormControl>
                <Input {...field} placeholder="Recipient address" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CreateStreamFormSection>

      <CreateStreamFormSection
        title="Duration"
        description={
          duration && duration > 0
            ? `Stream will have a total duration of ${formatDurationMillis(duration)}`
            : undefined
        }
      >
        <FormItem direction="row" className="col-span-6 sm:col-span-3">
          <FormControl>
            <Checkbox checked={!startTime || startTime <= 0} onCheckedChange={setStartOnCreate} />
          </FormControl>
          <FormLabel>Start on stream creation</FormLabel>
        </FormItem>

        {!isPrepaid && (
          <FormItem direction="row" className="col-span-6 sm:col-span-3">
            <FormControl>
              <Checkbox checked={!isPrepaid && (!endTime || endTime <= 0)} onCheckedChange={setHasNoEndTime} />
            </FormControl>
            <FormLabel>No end time</FormLabel>
          </FormItem>
        )}

        <FormField
          control={form.control}
          name="startTime"
          render={({ field }) => {
            const value = field.value
            const isDisabled = !value || value <= 0
            return (
              <FormItem className="col-span-6 sm:col-span-3 sm:col-start-1">
                <FormLabel>Start time</FormLabel>
                <FormControl>
                  <DateTimeInput
                    {...field}
                    value={field.value || 0}
                    onChange={(value) => {
                      field.onChange(value || 0)
                      updateTimes()
                    }}
                    disabled={isDisabled}
                    placeholder={isDisabled ? 'Start on stream creation' : undefined}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />

        <FormField
          control={form.control}
          name="endTime"
          render={({ field }) => {
            const value = field.value
            const isDisabled = !isPrepaid && (!value || value <= 0)
            return (
              <FormItem className="col-span-6 sm:col-span-3">
                <FormLabel>End time</FormLabel>
                <FormControl>
                  <DateTimeInput
                    {...field}
                    value={value || 0}
                    onChange={(value) => {
                      field.onChange(value || 0)
                      updateTimes()
                    }}
                    disabled={isDisabled}
                    placeholder={isDisabled ? 'No end time' : undefined}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />
      </CreateStreamFormSection>

      <CreateStreamFormSection title="Payment">
        <FormField
          control={form.control}
          name="token"
          render={({ field: { ref, ...field } }) => (
            <FormItem className="col-span-6">
              <FormLabel>Token</FormLabel>
              <FormDescription>Token to use as mode of payment</FormDescription>
              <Select {...field} onValueChange={setToken}>
                <FormControl>
                  <SelectTrigger ref={ref}>
                    <SelectValue placeholder="Select a token" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tokenAccounts.map((ta) => (
                    <SelectItem key={ta.data.mint.toString()} value={ta.data.mint.toString()}>
                      {ta.tokenInfo?.name || ta.data.mint.toString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {tokenAccount && (
          <>
            <FormField
              control={form.control}
              name="initialAmount"
              render={({ field }) => (
                <FormItem className="col-span-6">
                  <FormLabel>{`Payment amount on stream start${tokenCurrencyIndication}`}</FormLabel>
                  <FormDescription>
                    {`One-time/cliff amount to send ${
                      startTime == null || startTime <= 0
                        ? 'on stream creation'
                        : `at start time - ${formatTimeFromMillis(startTime)}`
                    }`}
                  </FormDescription>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || undefined}
                      onChange={(e) => {
                        field.onChange(e)
                        updatePaymentProperties()
                      }}
                      placeholder="Payment amount on stream start"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem className="col-span-6">
              <FormLabel>Payment interval</FormLabel>
              <FormDescription>Release payments to the recipient every</FormDescription>
              <FormControl>
                <div className="mt-0 grid w-full grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="flowIntervalCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="Payment interval"
                            className="col-span-2 md:col-span-1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="flowIntervalTimePeriod"
                    render={({ field: { ref, ...field } }) => (
                      <FormItem>
                        <Select {...field} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger ref={ref}>
                              <SelectValue placeholder="Select a time period" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TIME_PERIODS.map((tp) => (
                              <SelectItem key={tp.value} value={tp.value}>
                                {tp.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormField
              control={form.control}
              name="flowRate"
              render={({ field }) => (
                <FormItem className="col-span-6">
                  <FormLabel>{`Payment amount sent every interval${tokenCurrencyIndication}`}</FormLabel>
                  {paymentProperties.flowInterval.gt(BN_ZERO) && (
                    <FormDescription>
                      {`Amount to stream every ${formatDurationFromBnSeconds(paymentProperties.flowInterval)}`}
                    </FormDescription>
                  )}
                  <FormControl>
                    <Input {...field} placeholder="Payment amount sent every interval" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isPrepaid && (
              <FormField
                control={form.control}
                name="topupAmount"
                render={({ field }) => (
                  <FormItem className="col-span-6">
                    <FormLabel>Initial deposit</FormLabel>
                    {paymentProperties.topupNeeded.gt(BN_ZERO) && (
                      <FormDescription>
                        {`Minimum initial deposit required is ${formatTokenAmount(
                          paymentProperties.topupNeeded,
                          tokenAccount?.tokenInfo,
                        )}`}
                        . Why? Read more about the reason{' '}
                        <Link variant="highlighted" href="/docs/resources/types-of-streams#unbounded-streams">
                          here
                        </Link>
                      </FormDescription>
                    )}
                    <FormControl>
                      <Input {...field} placeholder="Initial deposit" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        )}
      </CreateStreamFormSection>

      <CreateStreamFormSection title="Advanced options">
        <FormField
          control={form.control}
          name="senderCanCancel"
          render={({ field }) => {
            return (
              <FormItem direction="row" className="col-span-6">
                <FormControl>
                  <Checkbox checked={!!field.value} onCheckedChange={(v) => field.onChange(v === true)} />
                </FormControl>
                <FormLabel>Sender (you) can cancel stream</FormLabel>
              </FormItem>
            )
          }}
        />

        {!isPrepaid && (
          <FormField
            control={form.control}
            name="senderCanChangeSender"
            render={({ field }) => {
              return (
                <FormItem direction="row" className="col-span-6">
                  <FormControl>
                    <Checkbox checked={!!field.value} onCheckedChange={(v) => field.onChange(v === true)} />
                  </FormControl>
                  <FormLabel>Sender (you) can change the stream sender</FormLabel>
                </FormItem>
              )
            }}
          />
        )}

        {!isPrepaid && (
          <FormField
            control={form.control}
            name="senderCanPause"
            render={({ field }) => {
              return (
                <FormItem direction="row" className="col-span-6">
                  <FormControl>
                    <Checkbox checked={!!field.value} onCheckedChange={(v) => field.onChange(v === true)} />
                  </FormControl>
                  <FormLabel>Sender (you) can pause stream</FormLabel>
                </FormItem>
              )
            }}
          />
        )}
      </CreateStreamFormSection>

      <div className="flex w-full flex-row items-center justify-center">
        <Button type="submit" variant="primary" size="xl" className="mx-auto block w-full lg:max-w-sm">
          Create stream
        </Button>
      </div>
    </>
  )
}

type CreateStreamFormSectionProps = {
  title: string
  description?: string
  children: React.ReactNode
}

function CreateStreamFormSection({ title, description, children }: CreateStreamFormSectionProps) {
  return (
    <div className="rounded-xl bg-bg p-4 text-fg shadow-sm ring-1 ring-neutral-6/60 sm:px-6 sm:py-4">
      <div className="lg:grid lg:grid-cols-3 lg:gap-6">
        <div className="lg:col-span-1">
          <H2 className="text-xl leading-7">{title}</H2>
          {description && <p className="text-sm text-fg-subtle">{description}</p>}
        </div>
        <div className="mt-6 lg:col-span-2 lg:mt-0">
          <div className="my-0.5 grid grid-cols-6 gap-x-4 gap-y-5">{children}</div>
        </div>
      </div>
    </div>
  )
}
