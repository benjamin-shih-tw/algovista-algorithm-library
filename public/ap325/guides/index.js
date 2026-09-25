import { world0Guides } from './world0.js'
import { world1Guides } from './world1.js'
import { world2Guides } from './world2.js'
import { world3Guides } from './world3.js'
import { world4Guides } from './world4.js'
import { world5Guides } from './world5.js'
import { world6Guides } from './world6.js'
import { world7Guides } from './world7.js'
import { world8Guides } from './world8.js'

export const guideByModule = {
  ...world0Guides,
  ...world1Guides,
  ...world2Guides,
  ...world3Guides,
  ...world4Guides,
  ...world5Guides,
  ...world6Guides,
  ...world7Guides,
  ...world8Guides,
}

export const guideModuleCount = Object.keys(guideByModule).length
