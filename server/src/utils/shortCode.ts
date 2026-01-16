const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

export const generateShortCode = (): string => {
    const min = 62**6
    const max = (62**7-1)
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min
    return convertToBase62(randomNum)
}

const convertToBase62 = (num: number):string => {
    if( num === 0) {
        return BASE62[0]
    }
    let codeArray: string[] = []
    while( num > 0 ) {
        codeArray.push(BASE62[num % 62]) 
        num = Math.floor(num / 62)
    }
    codeArray.reverse()

    const shortCode: string = codeArray.join('')
    return shortCode 
}
