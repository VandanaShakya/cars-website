/** Shared scroll progress refs for hero wireframe → vertical showcase */
export const assembleProgress = { value: 0 }
export const verticalProgress = { value: 0 }
export const verticalLayout = { height: 2.4, centerY: 0.5 }

export function resetCarExperienceProgress() {
  assembleProgress.value = 0
  verticalProgress.value = 0
  verticalLayout.height = 2.4
  verticalLayout.centerY = 0.5
}
