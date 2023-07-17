import React from 'react'

import type { Preview } from '@storybook/react'

import { ThemeProvider } from '../src/contexts/theme'
import { WindowViewportProvider } from '../src/contexts/window-viewport-context'
import { monoFont, sansSerifFont } from '../src/lib/fonts'

import '../src/styles/global.css'

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story, context) => {
      document.body.classList.add(sansSerifFont.className, monoFont.className)
      return (
        <WindowViewportProvider>
          <ThemeProvider>
            <div className={`flex ${context.viewMode === 'story' && 'min-h-screen'}`}>
              <div className="flex min-h-full grow bg-bg p-4 text-fg">
                <div className="w-full">
                  <Story />
                </div>
              </div>
              <div className="flex min-h-full grow dark">
                <div className="flex min-h-full grow bg-bg p-4 text-fg">
                  <div className="w-full">
                    <Story />
                  </div>
                </div>
              </div>
            </div>
          </ThemeProvider>
        </WindowViewportProvider>
      )
    },
  ],
}

export default preview
