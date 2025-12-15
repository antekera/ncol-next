'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@components/ui/accordion'
import { Sparkles } from 'lucide-react'
import { GAEvent } from '@lib/utils'
import { GA_EVENTS } from '@lib/constants'

interface SummaryAccordionProps {
  summary: string
}

export const SummaryAccordion = ({ summary }: SummaryAccordionProps) => {
  return (
    <Accordion
      type='single'
      collapsible
      className='mt-4 mb-6 w-full'
      onValueChange={value => {
        if (value === 'item-1') {
          GAEvent({
            category: GA_EVENTS.AI_SUMMARY.CATEGORY,
            label: GA_EVENTS.AI_SUMMARY.LABEL
          })
        }
      }}
    >
      <AccordionItem value='item-1' className='border-none'>
        <AccordionTrigger className='bg-gradient-to-r from-blue-400 to-blue-600 px-4 py-3 text-white hover:from-blue-500 hover:to-blue-700 hover:no-underline data-[state=closed]:rounded-lg data-[state=open]:rounded-t-lg dark:from-blue-600 dark:to-blue-800'>
          <div className='relative flex w-full items-center justify-center'>
            <div className='absolute left-0 flex items-center'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm'>
                <Sparkles className='h-5 w-5 text-white' />
              </div>
            </div>
            <span className='font-sans text-sm font-bold tracking-wide uppercase'>
              Ver Resumen
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className='rounded-b-lg bg-slate-100 p-6 text-base leading-relaxed text-slate-700 dark:bg-slate-800 dark:text-slate-300'>
          <p className='mb-4 font-sans text-xs text-slate-500 dark:text-slate-400'>
            Resumen generado con una herramienta de Inteligencia Artificial y
            revisado por el autor de este artículo.
          </p>
          <p>{summary}</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
