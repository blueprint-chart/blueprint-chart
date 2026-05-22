import { computed, type ComputedRef } from 'vue'
import { useChartSession } from '@/stores/chartSession'

export interface UseSheetNumber {
  sheetNumber: ComputedRef<string>
  sheetId: ComputedRef<string>
  isDraft: ComputedRef<boolean>
}

const DRAFT_PLACEHOLDER = 'S-———'   // three em-dashes

export function useSheetNumber(): UseSheetNumber {
  const session = useChartSession()

  const sheetNumber = computed(() => (session.sheetNumber.value ? `S-${session.sheetNumber.value}` : DRAFT_PLACEHOLDER))
  const sheetId = computed(() => session.sheetId.value)
  const isDraft = computed(() => session.sheetNumber.value === null)

  return { sheetNumber, sheetId, isDraft }
}
