'use client'

import * as React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { BN, web3 } from '@coral-xyz/anchor'
import { zodResolver } from '@hookform/resolvers/zod'
import { TokenInfo } from '@solana/spl-token-registry'
import { BN_ZERO, compareFnStreamStatus, Stream, StreamPaymentStatus, StreamStatus } from '@superstream/client'
import { ArrowUpCircleIcon, ChevronDownIcon, XIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { WEEK_MILLIS } from '@/lib/date'
import {
  convertTimeInMillisToBnSecs,
  formatDurationFromBnSeconds,
  formatTimeFromBnSeconds,
  OnChainTimeProvider,
  useOnChainTimeContext,
} from '@/lib/solana/date'
import { getAnchorErrorMessage } from '@/lib/solana/error'
import {
  andStreamFilters,
  andStreamSorts,
  DEFAULT_STREAM_SORT,
  reverseStreamSort,
  StreamFilter,
  StreamFilterCategory,
  StreamSort,
  streamSortByName,
  StreamSortCategory,
} from '@/lib/solana/stream'
import { useStreamsContext } from '@/lib/solana/streams'
import { formatTokenAmount, parseTokenAmount, useClusterTokens } from '@/lib/solana/tokens'
import { shortenPublicKey, useWallet } from '@/lib/solana/wallet'
import { zTokenAmount } from '@/lib/solana/zod'
import { zStringRequired } from '@/lib/zod'
import { Badge } from '@/components/lib/badge'
import { Body } from '@/components/lib/body'
import { Button } from '@/components/lib/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/lib/dialog'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuContentProps,
  DropdownMenuTrigger,
} from '@/components/lib/dropdown-menu'
import { Footer } from '@/components/lib/footer'
import { FormControl, FormField, FormItem, FormMessage, FormProvider } from '@/components/lib/form'
import { Input } from '@/components/lib/input'
import { Link } from '@/components/lib/link'
import { buttonStyles } from '@/components/lib/styles'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/lib/table'
import { useToastContext } from '@/components/lib/toast'

const FILTERS_QUERY_PARAM = 'filters'
const SORT_QUERY_PARAM = 'filters'

const DIR_FILTER_ID = 'dir'
const TYPE_FILTER_ID = 'type'
const STATUS_FILTER_ID = 'status'
const PAYMENT_STATUS_FILTER_ID = 'payment-status'

export default function DashboardPage() {
  const { streams } = useStreamsContext()

  return streams && streams.length > 0 ? (
    <StreamsFiltersAndTable streams={streams} />
  ) : (
    <div className="mx-auto my-8 flex w-full max-w-4xl flex-col items-center">
      <h3 className="text-2xl font-semibold">No streams</h3>
      <p className="mt-1 text-center text-lg text-fg/60">Get started by creating a new stream</p>
      <div className="mt-6">
        <Link variant="unstyled" href="/dashboard/create" className={buttonStyles({ variant: 'primary', size: 'lg' })}>
          Create stream
        </Link>
      </div>
    </div>
  )
}

type StreamsFiltersAndTableProps = {
  streams: Stream[]
}

function StreamsFiltersAndTable({ streams }: StreamsFiltersAndTableProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const getInitialFilterValue = React.useCallback(
    (id: string): string[] => {
      const filters = searchParams.get(FILTERS_QUERY_PARAM)
      if (!filters) {
        return []
      }
      const categories = filters.split(';')
      for (const category of categories) {
        if (!category || !category.startsWith(id)) {
          continue
        }
        const idx = category.indexOf(':')
        if (idx >= 0) {
          return category
            .slice(idx + 1)
            .split(',')
            .map((s) => s.trim())
            .filter((s) => !!s)
        } else {
          return []
        }
      }
      return []
    },
    [searchParams],
  )

  const getInitialSortValue = React.useCallback((): string[] => {
    const sort = searchParams.get(SORT_QUERY_PARAM)
    if (!sort) {
      return []
    }
    return sort
      .split(',')
      .map((s) => s.trim())
      .filter((s) => !!s)
  }, [searchParams])

  const [directionFilterValues, setDirectionFilterValues] = React.useState<string[]>(
    getInitialFilterValue(DIR_FILTER_ID),
  )
  const [typeFilterValues, setTypeFilterValues] = React.useState<string[]>(getInitialFilterValue(TYPE_FILTER_ID))
  const [statusFilterValues, setStatusFilterValues] = React.useState<string[]>(getInitialFilterValue(STATUS_FILTER_ID))
  const [paymentStatusFilterValues, setPaymentStatusFilterValues] = React.useState<string[]>(
    getInitialFilterValue(PAYMENT_STATUS_FILTER_ID),
  )
  const [sortValues, setSortValues] = React.useState<string[]>(getInitialSortValue())

  const directionFilterCategory = React.useMemo(
    () => getDirectionFilterCategory(DIR_FILTER_ID, directionFilterValues, setDirectionFilterValues),
    [directionFilterValues],
  )
  const typeFilterCategory = React.useMemo(
    () => getTypeFilterCategory(TYPE_FILTER_ID, typeFilterValues, setTypeFilterValues),
    [typeFilterValues],
  )
  const statusFilterCategory = React.useMemo(
    () => getStatusFilterCategory(STATUS_FILTER_ID, statusFilterValues, setStatusFilterValues),
    [statusFilterValues],
  )
  const paymentStatusFilterCategory = React.useMemo(
    () =>
      getPaymentStatusFilterCategory(PAYMENT_STATUS_FILTER_ID, paymentStatusFilterValues, setPaymentStatusFilterValues),
    [paymentStatusFilterValues],
  )
  const filterCategories = React.useMemo(
    () => [directionFilterCategory, typeFilterCategory, statusFilterCategory, paymentStatusFilterCategory],
    [directionFilterCategory, paymentStatusFilterCategory, statusFilterCategory, typeFilterCategory],
  )
  const sortCategory = getSortCategory(sortValues, setSortValues)

  const serializedFilters = React.useMemo(() => {
    const filters: string[] = []
    for (const category of filterCategories) {
      if (category.values && category.values.length > 0) {
        filters.push(`${category.id}:${category.values.join(',')}`)
      }
    }
    return filters.join(';')
  }, [filterCategories])

  const serializedSort = React.useMemo(() => {
    if (sortCategory.values && sortCategory.values.length > 0) {
      return `${sortCategory.values.join(',')}`
    }
    return ''
  }, [sortCategory.values])

  React.useEffect(() => {
    if (!window || !window.history?.replaceState) {
      return
    }

    const newSearchParams = new URLSearchParams(searchParams.toString())
    if (serializedFilters) {
      newSearchParams.set(FILTERS_QUERY_PARAM, serializedFilters)
    }
    if (serializedSort) {
      newSearchParams.set(SORT_QUERY_PARAM, serializedSort)
    }

    const search = newSearchParams.toString()
    const query = search ? `?${search}` : ''
    window.history.replaceState(null, '', `${pathname}${query}`)
  }, [searchParams, pathname, serializedFilters, serializedSort])

  const filter = andStreamFilters(filterCategories.filter((fc) => fc.values.length > 0).map((fc) => fc.filter))
  const sort = andStreamSorts(
    sortCategory.options
      .filter((o) => sortValues.indexOf(o.value) >= 0)
      .map((o) => o.sort)
      .concat([DEFAULT_STREAM_SORT]),
  )

  return (
    <OnChainTimeProvider>
      <div className="flex flex-col">
        <StreamFilters filterCategories={filterCategories} sortCategory={sortCategory} />
        <StreamsTable streams={streams} filter={filter} sort={sort} />
      </div>
    </OnChainTimeProvider>
  )
}

function getDirectionFilterCategory(
  id: string,
  values: string[],
  setValues: (values: string[]) => void,
): StreamFilterCategory {
  return {
    id,
    label: 'Direction',
    values,
    setValues,
    filter: (stream: Stream) => {
      const value = stream.isRecipient() ? 'incoming' : stream.isSender() ? 'outgoing' : null
      return value ? values.indexOf(value) >= 0 : false
    },
    options: [
      {
        label: 'Incoming',
        value: 'incoming',
      },
      {
        label: 'Outgoing',
        value: 'outgoing',
      },
    ],
  }
}

function getTypeFilterCategory(
  id: string,
  values: string[],
  setValues: (values: string[]) => void,
): StreamFilterCategory {
  return {
    id,
    label: 'Type',
    values,
    setValues,
    filter: (stream: Stream) => {
      const value = stream.isPrepaid ? 'prepaid' : 'non-prepaid'
      return value ? values.indexOf(value) >= 0 : false
    },
    options: [
      {
        label: 'Prepaid',
        value: 'prepaid',
      },
      {
        label: 'Non-prepaid',
        value: 'non-prepaid',
      },
    ],
  }
}

function getStatusFilterCategory(
  id: string,
  values: string[],
  setValues: (values: string[]) => void,
): StreamFilterCategory {
  return {
    id,
    label: 'Status',
    values,
    setValues,
    filter: (stream: Stream, at: BN) => {
      const value = stream.getStatus(at)
      return values.indexOf(value) >= 0
    },
    options: [
      {
        label: 'Not started',
        value: StreamStatus.NOT_STARTED,
      },
      {
        label: 'Streaming',
        value: StreamStatus.STREAMING,
      },
      {
        label: 'Paused',
        value: StreamStatus.PAUSED,
      },
      {
        label: 'Cancelled',
        value: StreamStatus.CANCELLED,
      },
      {
        label: 'Ended',
        value: StreamStatus.ENDED,
      },
    ],
  }
}

function getPaymentStatusFilterCategory(
  id: string,
  values: string[],
  setValues: (values: string[]) => void,
): StreamFilterCategory {
  return {
    id,
    label: 'Payment status',
    values,
    setValues,
    filter: (stream: Stream, at: BN) => {
      const value = stream.getPaymentStatus(at)
      return values.indexOf(value) >= 0
    },
    options: [
      {
        label: 'Prepaid',
        value: StreamPaymentStatus.PREPAID,
      },
      {
        label: 'Fully paid',
        value: StreamPaymentStatus.FULLY_PAID,
      },
      {
        label: 'Low topup',
        value: StreamPaymentStatus.LOW_TOPUP,
      },
      {
        label: 'Needs topup',
        value: StreamPaymentStatus.NEEDS_TOPUP,
      },
    ],
  }
}

type StreamFilterOrSortPopoverProps = (
  | StreamFilterCategory
  | (StreamSortCategory & {
      id: string
      label: string
    })
) & {
  align?: DropdownMenuContentProps['align']
  shouldNumberOptions?: boolean
  shouldDisplayActiveOptions?: boolean
}

function StreamFilterOrSortPopover({
  label,
  values,
  setValues,
  options,
  align = 'end',
  shouldNumberOptions,
  shouldDisplayActiveOptions,
}: StreamFilterOrSortPopoverProps) {
  const onChange = React.useCallback(
    (value: string, checked: boolean) => {
      const idx = values.indexOf(value)
      if (checked) {
        if (idx < 0) {
          setValues([...values, value])
        }
      } else {
        if (idx >= 0) {
          setValues([...values.slice(0, idx), ...values.slice(idx + 1)])
        }
      }
    },
    [setValues, values],
  )

  const activeOptions = values
    .map((v) => options.find((o) => o.value === v))
    .filter((o) => o != null)
    .map((o) => o!)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="group font-subtlelight">
          {`${label}${
            shouldDisplayActiveOptions && activeOptions.length > 0
              ? `: ${activeOptions[0]!.label}${activeOptions.length > 1 ? ` and ${activeOptions.length - 1} more` : ''}`
              : ''
          }`}
          {!shouldDisplayActiveOptions && activeOptions.length > 0 ? (
            <span className="ml-1 rounded bg-bg-emphasis px-1.5 py-0.5 text-xs font-medium tabular-nums text-fg/60 group-hover:bg-bg-emphasis/80">
              {activeOptions.length}
            </span>
          ) : null}
          <ChevronDownIcon className="ml-1 mt-0.5 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} className="w-44">
        {options.map((option) => {
          const valuesIdx = values.indexOf(option.value)
          return (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={valuesIdx >= 0}
              onCheckedChange={(checked) => onChange(option.value, checked)}
            >
              {option.label}
              {shouldNumberOptions && activeOptions.length > 1 && valuesIdx >= 0 ? (
                <span className="ml-0.5 rounded bg-bg-emphasis px-1.5 py-0.5 text-xs font-medium tabular-nums text-fg/60 group-hover:bg-bg-emphasis/80">
                  {valuesIdx + 1}
                </span>
              ) : null}
            </DropdownMenuCheckboxItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

type StreamsFiltersProps = {
  filterCategories: StreamFilterCategory[]
  sortCategory: StreamSortCategory
}

function StreamFilters({ filterCategories, sortCategory }: StreamsFiltersProps) {
  const activeFilters = filterCategories.flatMap((category) => {
    return category.values
      .map((v) => {
        const option = category.options.find((o) => o.value === v)
        return option
          ? {
              ...option,
              categoryId: category.id,
              categoryLabel: category.label,
              onRemove: () => {
                const idx = category.values.indexOf(option.value)
                if (idx >= 0) {
                  category.setValues([...category.values.slice(0, idx), ...category.values.slice(idx + 1)])
                }
              },
            }
          : null
      })
      .filter((v) => v != null)
      .map((v) => v!)
  })

  return (
    <div className="-mx-6 mb-3 space-y-2 md:mx-0">
      <div className="flex flex-row items-center justify-between">
        <div className="mx-1 md:mx-0">
          <StreamFilterOrSortPopover
            id="sort"
            label="Sort"
            align="start"
            shouldNumberOptions={true}
            shouldDisplayActiveOptions={true}
            {...sortCategory}
          />
        </div>

        <div className="mx-1 md:mx-0">
          <div className="flex flex-row items-center gap-2">
            {filterCategories.map((filterCategory) => (
              <StreamFilterOrSortPopover key={filterCategory.label} {...filterCategory} />
            ))}
          </div>
        </div>
      </div>
      {activeFilters.length > 0 && (
        <div className="flex flex-row flex-wrap items-center text-xs md:-mx-1">
          {activeFilters.map((activeFilter) => (
            <span
              key={`active-filter-${activeFilter.categoryId}-${activeFilter.value}`}
              className="group m-1 inline-flex items-center rounded-full border border-neutral-7 bg-bg py-1 pl-3 pr-1.5 text-fg hover:border-neutral-8"
            >
              <span>
                <span className="font-medium">{activeFilter.categoryLabel}:</span>
                <span> {activeFilter.label}</span>
              </span>
              <Button
                aria-label={`Remove filter for ${activeFilter.categoryLabel}: ${activeFilter.label}`}
                variant="ghost"
                shape="square"
                className="ml-1 h-5 w-5 shrink-0 rounded-full text-fg/60 group-hover:text-fg/80"
                onClick={activeFilter.onRemove}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

type StreamsTableProps = {
  streams: Stream[]
  filter: StreamFilter
  sort: StreamSort
}

function StreamsTable({ streams, filter, sort }: StreamsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const selectedStreamPublicKey = React.useMemo(() => {
    const selectedStreamQueryParam = searchParams.get('selected_stream')
    if (!selectedStreamQueryParam) {
      return undefined
    }

    try {
      return new web3.PublicKey(selectedStreamQueryParam)
    } catch (e) {
      console.error('Invalid selected stream public key in query params', e)
      return undefined
    }
  }, [searchParams])

  const [selectedPublicKey, setSelectedPublicKey] = React.useState<web3.PublicKey | undefined>(selectedStreamPublicKey)

  const selectedStream = React.useMemo(
    () => (selectedPublicKey ? streams.find((s) => s.publicKey.equals(selectedPublicKey)) || null : null),
    [streams, selectedPublicKey],
  )

  const [isDialogOpen, setIsDialogOpen] = React.useState(selectedStreamPublicKey != null)

  const wallet = useWallet()
  const tokens = useClusterTokens()
  const { onChainTime: at, refreshOnChainTime } = useOnChainTimeContext()

  const updateUrl = React.useCallback(
    (stream?: Stream) => {
      const newSearchParams = new URLSearchParams(searchParams.toString())
      if (stream) {
        newSearchParams.set('selected_stream', stream.publicKey.toString())
      } else {
        newSearchParams.delete('selected_stream')
      }
      const search = newSearchParams.toString()
      const query = search ? `?${search}` : ''
      router.push(`${pathname}${query}`)
    },
    [pathname, router, searchParams],
  )

  const openModal = React.useCallback(
    (stream: Stream) => {
      setSelectedPublicKey(stream.publicKey)
      setIsDialogOpen(true)
      updateUrl(stream)
    },
    [updateUrl],
  )

  const closeModal = React.useCallback(() => {
    setSelectedPublicKey(undefined)
    setIsDialogOpen(false)
    updateUrl()
  }, [updateUrl])

  const filteredStreams = React.useMemo(() => streams.filter((s) => (at ? filter(s, at) : true)), [at, filter, streams])
  const filteredAndSortedStreams = React.useMemo(
    () => [...filteredStreams].sort((a, b) => (at ? sort(a, b, at) : DEFAULT_STREAM_SORT(a, b))),
    [at, filteredStreams, sort],
  )

  React.useEffect(() => {
    void refreshOnChainTime()
  }, [refreshOnChainTime])

  if (!wallet || !at) {
    return null
  }

  return (
    <div className="-mx-6 flex flex-col text-center md:mx-0">
      <div className="overflow-hidden bg-bg text-fg shadow ring-1 ring-fg/5 md:rounded-md">
        <Table className="min-w-full">
          <TableHeader className="hidden sm:table-header-group">
            <TableRow>
              <TableHead className="hidden md:table-cell md:w-[5%]" />
              <TableHead className="hidden text-center md:table-cell md:w-[15%]">Status</TableHead>
              <TableHead className="w-full sm:w-[35%] md:w-[17.5%]">
                <span className="hidden md:table-cell">Name</span>
                <span className="md:hidden">About</span>
              </TableHead>
              <TableHead className="hidden md:table-cell md:w-[15%]">To/From</TableHead>
              <TableHead className="w-[65%] md:w-[20%]">
                <span className="hidden md:table-cell">Weekly value</span>
                <span className="md:hidden">Value</span>
              </TableHead>
              <TableHead className="hidden md:table-cell md:w-[27.5%]">Withdrawable</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedStreams.map((stream) => (
              <StreamTableRow
                key={`${stream.seed.toString()}-${stream.mint.toString()}-${stream.name}`}
                tokens={tokens}
                at={at}
                stream={stream}
                onClick={openModal}
              />
            ))}
          </TableBody>
        </Table>
      </div>
      {filteredStreams.length === 0 && <p className="mt-6 text-base text-fg/60">No streams found</p>}

      <StreamDialog
        at={at}
        stream={selectedStream}
        isOpen={isDialogOpen}
        setIsOpen={(isOpen) => {
          if (!isOpen) {
            closeModal()
          }
        }}
      />
    </div>
  )
}

type StreamsTableRowProps = {
  tokens: Map<string, TokenInfo>
  at: BN
  stream: Stream
  onClick: (stream: Stream) => void
}

function StreamTableRow({ tokens, at, stream, onClick }: StreamsTableRowProps) {
  const token = tokens.get(stream.mint.toString())
  const isSender = stream.isSender()
  const otherAddress = shortenPublicKey(isSender ? stream.recipient : stream.sender)

  const status = stream.getStatus(at)
  const statusBadge = getStatusBadge(status)

  const paymentStatus = stream.getPaymentStatus(at)
  const paymentStatusBadge = getPaymentStatusBadge(paymentStatus, true)

  const amountPerWeek =
    !stream.hasFlowPayments() || stream.flowInterval.lte(BN_ZERO)
      ? BN_ZERO
      : stream.flowRate.mul(convertTimeInMillisToBnSecs(WEEK_MILLIS).div(stream.flowInterval))

  const amountAvailableToWithdraw = stream.getAmountAvailableToWithdraw(at)

  return (
    <TableRow
      className="cursor-pointer bg-bg text-sm font-subtlelight text-fg hover:bg-bg-emphasis"
      onClick={() => onClick(stream)}
    >
      <TableCell className="hidden md:table-cell">
        <span className="inline-flex h-full w-[1.25rem] items-center justify-center align-middle">
          {isSender ? (
            <ArrowUpCircleIcon className="h-[1.25rem] w-[1.25rem] rotate-[135deg] text-error-9" />
          ) : (
            <ArrowUpCircleIcon className="h-[1.25rem] w-[1.25rem] rotate-45 text-primary-9" />
          )}
        </span>
      </TableCell>
      <TableCell className="hidden text-center md:table-cell">{statusBadge}</TableCell>
      <TableCell className="max-w-[10rem] sm:max-w-[12rem] md:max-w-[15rem]">
        <span className="inline-flex w-full flex-col gap-1">
          <span className="flex items-center justify-between gap-1.5">
            <span className="line-clamp-1 text-base font-medium sm:font-subtlelight md:text-sm">{stream.name}</span>
            <span className="flex items-center gap-1.5 sm:hidden">
              {statusBadge}
              {!!paymentStatusBadge && <span className="sm:hidden">{paymentStatusBadge}</span>}
            </span>
          </span>
          <span className="flex items-center gap-1.5 md:hidden">
            <span className="line-clamp-1">{`${isSender ? 'To' : 'From'}: ${otherAddress}`}</span>
            {isSender ? (
              <ArrowUpCircleIcon className="h-4 w-4 rotate-[135deg] text-error-9" />
            ) : (
              <ArrowUpCircleIcon className="h-4 w-4 rotate-45 text-primary-9" />
            )}
          </span>
          <span className="hidden sm:inline-block md:hidden">{statusBadge}</span>
          <span className="line-clamp-1 sm:hidden">{`Weekly value: ${formatTokenAmount(amountPerWeek, token)}`}</span>
          <span className="line-clamp-1 sm:hidden md:hidden">{`Withdrawable: ${formatTokenAmount(
            amountAvailableToWithdraw,
            token,
          )}`}</span>
        </span>
      </TableCell>
      <TableCell className="hidden font-mono text-[0.9375rem]/[1.25rem] font-medium tracking-wider md:table-cell">
        <span className="line-clamp-1">{otherAddress}</span>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <span className="inline-flex flex-col gap-1">
          <span className="line-clamp-1">
            <span className="hidden md:table-cell">{formatTokenAmount(amountPerWeek, token)}</span>
            <span className="md:hidden">{`Weekly: ${formatTokenAmount(amountPerWeek, token)}`}</span>
          </span>
          <span className="line-clamp-1 md:hidden">{`Withdrawable: ${formatTokenAmount(
            amountAvailableToWithdraw,
            token,
          )}`}</span>
          {!!paymentStatusBadge && <span className="md:hidden">{paymentStatusBadge}</span>}
        </span>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex items-center justify-between gap-2">
          <span>{formatTokenAmount(amountAvailableToWithdraw, token)}</span>
          {!!paymentStatusBadge && <span>{paymentStatusBadge}</span>}
        </div>
      </TableCell>
    </TableRow>
  )
}

const STREAM_DIALOG_PLACEHOLDER = '---'

type StreamDialogProps = {
  at: BN
  stream?: Stream | null

  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

function StreamDialog({ at, stream, isOpen, setIsOpen }: StreamDialogProps) {
  const { addToast } = useToastContext()

  const tokens = useClusterTokens()
  const token = stream ? tokens.get(stream.mint.toString()) : undefined

  const { refreshOnChainTime } = useOnChainTimeContext()
  const { refreshSingle } = useStreamsContext()

  const isSender = stream?.isSender() || false
  const isRecipient = stream?.isRecipient() || false
  const hasStopped = stream?.hasStopped(at) || false
  const otherAddress = stream
    ? shortenPublicKey(isSender ? stream.recipient : stream.sender)
    : STREAM_DIALOG_PLACEHOLDER
  const startsAt = stream ? formatTimeFromBnSeconds(stream.startsAt) : STREAM_DIALOG_PLACEHOLDER
  const endsAt = stream
    ? stream.endsAt.lte(BN_ZERO)
      ? 'Never'
      : formatTimeFromBnSeconds(stream.endsAt)
    : STREAM_DIALOG_PLACEHOLDER
  const cancelledAt = stream
    ? stream.cancelledAt.lte(BN_ZERO)
      ? 'Never'
      : formatTimeFromBnSeconds(stream.cancelledAt)
    : STREAM_DIALOG_PLACEHOLDER

  const hasStarted = !hasStopped && stream ? stream.startsAt.lte(at) : false
  const showEndsAt = !hasStopped
  const showEndedAt = hasStopped && stream ? !stream.isCancelled : false
  const showCancelledAt = stream ? stream.isCancelled : false

  const mint = stream ? (token ? token.symbol : shortenPublicKey(stream.mint)) : STREAM_DIALOG_PLACEHOLDER
  const initialAmount = stream ? formatTokenAmount(stream.initialAmount, token) : STREAM_DIALOG_PLACEHOLDER
  const flowInterval = stream ? formatDurationFromBnSeconds(stream.flowInterval) : STREAM_DIALOG_PLACEHOLDER
  const flowRate = stream ? formatTokenAmount(stream.flowRate, token) : STREAM_DIALOG_PLACEHOLDER

  const status = stream?.getStatus(at)
  const statusBadge = status ? getStatusBadge(status) : null

  const paymentStatus = stream?.getPaymentStatus(at)
  const paymentStatusBadge = paymentStatus ? getPaymentStatusBadge(paymentStatus, true) : null

  const amountOwed = stream ? stream.getAmountOwed(at) : BN_ZERO
  const amountAvailableToWithdraw = stream ? stream.getAmountAvailableToWithdraw(at) : BN_ZERO

  const topupRemainingAmount = stream ? stream.totalTopupAmount.sub(amountOwed) : BN_ZERO
  const topupRemaining = formatTokenAmount(topupRemainingAmount, token)
  const topupRemainingSecs =
    stream &&
    paymentStatus !== StreamPaymentStatus.PREPAID &&
    paymentStatus !== StreamPaymentStatus.FULLY_PAID &&
    topupRemainingAmount.gt(BN_ZERO) &&
    stream.hasFlowPayments()
      ? formatDurationFromBnSeconds(topupRemainingAmount.mul(stream.flowInterval).div(stream.flowRate))
      : null

  const canDoOperation = React.useCallback(
    (op: (stream: Stream) => void) => {
      if (!stream) {
        return false
      }

      try {
        op(stream)
        return true
      } catch (e) {
        return false
      }
    },
    [stream],
  )

  const doOperation = React.useCallback(
    async (op: (stream: Stream) => Promise<void>) => {
      if (!stream) {
        return
      }

      try {
        await op(stream)
        await Promise.all([refreshSingle(stream), refreshOnChainTime()])
      } catch (e: unknown) {
        console.error(e)
        addToast({ variant: 'error', title: getAnchorErrorMessage(e) })
      }
    },
    [stream, refreshSingle, refreshOnChainTime, addToast],
  )

  const canCancel = React.useMemo(() => {
    return canDoOperation((s) => s.validateCancel(at))
  }, [at, canDoOperation])

  const cancel = React.useCallback(async () => {
    await doOperation((s) => s.cancel(at))
  }, [at, doOperation])

  const canWithdrawExcessTopupNonPrepaidEnded = React.useMemo(() => {
    return canDoOperation((s) => s.validateWithdrawExcessTopupNonPrepaidEnded(at))
  }, [at, canDoOperation])

  const withdrawExcessTopupNonPrepaidEnded = React.useCallback(async () => {
    await doOperation((s) => s.withdrawExcessTopupNonPrepaidEnded(at))
  }, [at, doOperation])

  const canTopup = React.useMemo(() => {
    return canDoOperation((s) => {
      if (!isSender) {
        throw new Error('Only the sender can topup')
      }
      s.validateTopupNonPrepaid(at)
    })
  }, [isSender, at, canDoOperation])

  const topupForm = useForm({
    resolver: zodResolver(
      z.object({
        amount: zTokenAmount(
          zStringRequired('Topup amount'),
          'Topup amount',
          token,
          (amount) => {
            return amount.gt(BN_ZERO)
          },
          `Topup amount should be > 0 and have max ${token ? token.decimals : 0} decimal places`,
        ),
      }),
    ),
    defaultValues: {
      amount: '0',
    },
  })

  const handleTopupSubmit = topupForm.handleSubmit(async (data) => {
    await doOperation(async (s) => {
      await s.topupNonPrepaid(at, parseTokenAmount(data.amount)!)
    })
  })

  const canWithdraw = React.useMemo(() => {
    return canDoOperation((s) => s.validateWithdraw(at))
  }, [at, canDoOperation])

  const withdraw = React.useCallback(async () => {
    await doOperation((s) => s.withdraw(at))
  }, [at, doOperation])

  const canPause = React.useMemo(() => {
    return canDoOperation((s) => s.validatePauseNonPrepaid(at))
  }, [at, canDoOperation])

  const pause = React.useCallback(async () => {
    await doOperation((s) => s.pauseNonPrepaid(at))
  }, [at, doOperation])

  const canResume = React.useMemo(() => {
    return canDoOperation((s) => s.validateResumeNonPrepaid(at))
  }, [at, canDoOperation])

  const resume = React.useCallback(async () => {
    await doOperation((s) => s.resumeNonPrepaid(at))
  }, [at, doOperation])

  const sections = [
    <dl key="basic" className="grid grid-cols-1 gap-x-2 gap-y-3 sm:grid-cols-2">
      <div className="sm:col-span-1">
        <dt className="text-sm font-medium text-fg/60">Type</dt>
        <dd className="mt-0.5 text-sm">{stream?.isPrepaid ? 'Prepaid' : 'Topup when needed'}</dd>
      </div>
      <div className="sm:col-span-1">
        <dt className="text-sm font-medium text-fg/60">Direction</dt>
        <dd className="mt-0.5 flex flex-row items-center space-x-1.5 text-left text-sm">
          <span>{isSender ? 'Outgoing' : 'Incoming'}</span>
          {isSender ? (
            <ArrowUpCircleIcon className="h-4 w-4 rotate-[135deg] text-error-9" />
          ) : (
            <ArrowUpCircleIcon className="h-4 w-4 rotate-45 text-primary-9" />
          )}
        </dd>
      </div>
      <div className="sm:col-span-1">
        <dt className="text-sm font-medium text-fg/60">{isSender ? 'To' : 'From'}</dt>
        <dd className="mt-0.5 text-sm">{otherAddress}</dd>
      </div>
      <div className="sm:col-span-1">
        <dt className="text-sm font-medium text-fg/60">Status</dt>
        <dd className="mt-0.5 text-sm">{statusBadge}</dd>
      </div>
      <div className="sm:col-span-1">
        <dt className="text-sm font-medium text-fg/60">{hasStarted ? 'Started at' : 'Starts at'}</dt>
        <dd className="mt-0.5 text-sm">{startsAt}</dd>
      </div>
      {(showEndsAt || showEndedAt) && (
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-fg/60">{showEndsAt ? 'Ends at' : 'Ended at'}</dt>
          <dd className="mt-0.5 text-sm">{endsAt}</dd>
        </div>
      )}
      {showCancelledAt && (
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-fg/60">Cancelled at</dt>
          <dd className="mt-0.5 text-sm">{cancelledAt}</dd>
        </div>
      )}
    </dl>,
    <dl key="payment" className="grid grid-cols-1 gap-x-2 gap-y-4 sm:grid-cols-2">
      <div className="sm:col-span-1">
        <dt className="text-sm font-medium text-fg/60">Token</dt>
        <dd className="mt-0.5 text-sm">{mint}</dd>
      </div>
      <div className="sm:col-span-1">
        <dt className="text-sm font-medium text-fg/60">Payment amount on stream start</dt>
        <dd className="mt-0.5 text-sm">{initialAmount}</dd>
      </div>
      <div className="sm:col-span-1">
        <dt className="text-sm font-medium text-fg/60">Payment interval</dt>
        <dd className="mt-0.5 text-sm">{flowInterval}</dd>
      </div>
      <div className="sm:col-span-1">
        <dt className="text-sm font-medium text-fg/60">Payment amount per interval</dt>
        <dd className="mt-0.5 text-sm">{flowRate}</dd>
      </div>
    </dl>,
    <dl key="withdraw" className="grid grid-cols-1 gap-x-2 gap-y-4 sm:grid-cols-2">
      <div className="sm:col-span-1">
        <dt className="text-sm font-medium text-fg/60">Withdrawable amount</dt>
        <dd className="mt-0.5 text-sm">{formatTokenAmount(amountAvailableToWithdraw, token)}</dd>
      </div>
      {canWithdraw && (
        <div className="flex flex-row items-center sm:col-span-1">
          <Button variant="primary" size="sm" onClick={withdraw}>
            {isRecipient ? 'Withdraw' : 'Withdraw to recipient'}
          </Button>
        </div>
      )}
    </dl>,
    <dl key="topup">
      <div className="grid grid-cols-1 gap-x-2 gap-y-4 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-fg/60">Total topup</dt>
          <dd className="mt-0.5 text-sm">{formatTokenAmount(stream?.totalTopupAmount || BN_ZERO, token)}</dd>
        </div>
        <div className="sm:col-span-1 sm:col-start-1">
          <dt className="flex flex-row space-x-2 text-sm font-medium text-fg/60">
            <span>Topup remaining</span>
            {topupRemainingSecs && <span className="text-fg/60">{`(${topupRemainingSecs})`}</span>}
            <span>{paymentStatusBadge}</span>
          </dt>
          <dd className="mt-0.5 text-sm">
            <div>{topupRemaining}</div>
            <div></div>
          </dd>
          {canWithdrawExcessTopupNonPrepaidEnded && (
            <div className="flex flex-row items-center sm:col-span-1">
              {
                <Button variant="primary" size="sm" onClick={withdrawExcessTopupNonPrepaidEnded}>
                  Withdraw excess topup
                </Button>
              }
            </div>
          )}
        </div>
      </div>
      {canTopup && (
        <div className="mt-2 w-full text-sm">
          <dt className="text-sm font-medium text-fg/60">Topup</dt>
          <dd className="mt-1 w-full text-sm">
            <FormProvider {...topupForm}>
              <form onSubmit={handleTopupSubmit} className="flex w-full items-center">
                <FormField
                  control={topupForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="grow-[3]">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Topup amount"
                          className="col-span-1 h-8 w-full rounded-r-none border-r-0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" variant="primary" size="sm" className="col-span-1 h-8 grow-[1] rounded-l-none">
                  Topup
                </Button>
              </form>
            </FormProvider>
          </dd>
        </div>
      )}
    </dl>,
  ]

  const buttons: React.ReactNode[] = []
  if (canCancel) {
    buttons.push(
      <Button key="cancel" variant="error" size="sm" onClick={cancel}>
        Cancel stream
      </Button>,
    )
  }
  if (canPause) {
    buttons.push(
      <Button key="pause" variant="warn" size="sm" onClick={pause}>
        Pause stream
      </Button>,
    )
  }
  if (canResume) {
    buttons.push(
      <Button key="resume" variant="primary" size="sm" onClick={resume}>
        Resume stream
      </Button>,
    )
  }

  return (
    <Dialog open={isOpen && !!stream} onOpenChange={setIsOpen}>
      <DialogContent className="md:max-w-[40rem]">
        <DialogHeader>
          <DialogTitle>{stream?.name || '---'}</DialogTitle>
        </DialogHeader>
        <Body>
          {sections.map((section, i) => (
            <div key={i} className="border-b py-5 first:pt-0">
              {section}
            </div>
          ))}
        </Body>
        {buttons.length > 0 && <Footer>{buttons}</Footer>}
      </DialogContent>
    </Dialog>
  )
}

function getSortCategory(values: string[], setValues: (values: string[]) => void): StreamSortCategory {
  return {
    values,
    setValues,
    options: [
      {
        label: 'Newest',
        value: 'newest',
        sort: reverseStreamSort(Stream.compareFnCreatedAt),
      },
      {
        label: 'Oldest',
        value: 'oldest',
        sort: Stream.compareFnCreatedAt,
      },
      {
        label: 'Status',
        value: 'status',
        sort: (a: Stream, b: Stream, at: BN) => {
          return compareFnStreamStatus(a.getStatus(at), b.getStatus(at))
        },
      },
      {
        label: 'Status (Desc)',
        value: 'status-desc',
        sort: (a: Stream, b: Stream, at: BN) => {
          return -compareFnStreamStatus(a.getStatus(at), b.getStatus(at))
        },
      },
      {
        label: 'Alphabetical',
        value: 'alphabetical',
        sort: streamSortByName,
      },
      {
        label: 'Alphabetical (Desc)',
        value: 'alphabetical-desc',
        sort: reverseStreamSort(streamSortByName),
      },
    ],
  }
}

function getStatusBadge(status: StreamStatus): React.ReactNode {
  switch (status) {
    case StreamStatus.NOT_STARTED:
      return <Badge>Not started</Badge>
    case StreamStatus.ENDED:
      return <Badge>Ended</Badge>
    case StreamStatus.STREAMING:
      return <Badge variant="primary">Streaming</Badge>
    case StreamStatus.PAUSED:
      return <Badge variant="warn">Paused</Badge>
    case StreamStatus.CANCELLED:
      return <Badge variant="error">Cancelled</Badge>
    default:
      return null
  }
}

function getPaymentStatusBadge(
  paymentStatus: StreamPaymentStatus,
  shouldIgnoreStreamingStatus?: boolean,
): React.ReactNode {
  switch (paymentStatus) {
    case StreamPaymentStatus.PREPAID:
      return <Badge>Prepaid</Badge>
    case StreamPaymentStatus.FULLY_PAID:
      return <Badge>Fully paid</Badge>
    case StreamPaymentStatus.STREAMING:
      return shouldIgnoreStreamingStatus ? null : <Badge variant="primary">Streaming</Badge>
    case StreamPaymentStatus.LOW_TOPUP:
      return <Badge variant="warn">Low topup</Badge>
    case StreamPaymentStatus.NEEDS_TOPUP:
      return <Badge variant="error">Needs topup</Badge>
    default:
      return null
  }
}
