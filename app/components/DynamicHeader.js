'use client'

import { usePathname } from 'next/navigation'
import { useLanguageStore } from './languageStore'
import { dictionary } from '@/app/dictionary/dictionary'
export default function DynamicHeader() {
  const { language, setLanguage } = useLanguageStore();
  console.log('dictionary:', dictionary)
  const pathname = usePathname()
  const title = pathname.includes('select') ? dictionary?.select['AIReport'][language] : dictionary.select['IFRS S2'][language]
  
  return title
}