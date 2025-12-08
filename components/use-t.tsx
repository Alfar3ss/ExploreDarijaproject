"use client"
import { useLanguage } from "./language-provider"

// tiny helper hook returning the translation function `t(key)`
export function useT() {
  const { t } = useLanguage()
  return t
}

// For stronger typing of keys you can import `translations` and derive keys,
// but for now `t` accepts a dot-separated key string like `home.hero_title`.

export type TKey = string
