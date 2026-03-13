/**
 * 手机号生成工具库
 * 支持根据国家代码生成随机手机号
 */

// 随机生成指定长度的数字字符串
const randomDigits = (length: number): string => {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString()
  }
  return result
}

const randomPick = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)]!
}

// 国家生成规则映射
const rules: Record<string, () => string> = {
  'cn': () => {
    const prefixes = ['3', '4', '5', '6', '7', '8', '9']
    const prefix = '1' + randomPick(prefixes)
    return `+86${prefix}${randomDigits(9)}`
  },

  'us': () => {
    const areaCode = (Math.floor(Math.random() * 8) + 2).toString() + randomDigits(2)
    const exchangeCode = (Math.floor(Math.random() * 8) + 2).toString() + randomDigits(2)
    const subscriberNumber = randomDigits(4)
    return `+1${areaCode}${exchangeCode}${subscriberNumber}`
  },

  'my': () => {
    const isType11 = Math.random() < 0.3
    if (isType11) {
      return `+6011${randomDigits(8)}`
    } else {
      const prefix = randomPick(['0', '2', '3', '4', '6', '7', '8', '9'])
      return `+601${prefix}${randomDigits(7)}`
    }
  }
}

// SMSC 生成规则映射
const smscRules: Record<string, () => string> = {
  'cn': () => {
    const xyz = randomDigits(3)
    return `+8613800${xyz}500`
  },

  'us': () => {
    return rules['us']!()
  },

  'my': () => {
    const commonSmscs = [
      '+60120000015',
      '+60193900000',
      '+60162999902',
      '+60183800001',
      '+601138380000'
    ]
    return randomPick(commonSmscs)
  }
}

export const hasPhoneRule = (countryCode: string): boolean => {
  if (!countryCode) return false
  return !!rules[countryCode.toLowerCase()]
}

export const hasSMSCRule = (countryCode: string): boolean => {
  if (!countryCode) return false
  return !!smscRules[countryCode.toLowerCase()]
}

export const generatePhoneNumber = (countryCode: string): string => {
  if (!countryCode) return ''
  const generator = rules[countryCode.toLowerCase()]
  return generator ? generator() : ''
}

export const generateSMSC = (countryCode: string): string => {
  if (!countryCode) return ''
  const generator = smscRules[countryCode.toLowerCase()]
  return generator ? generator() : ''
}
