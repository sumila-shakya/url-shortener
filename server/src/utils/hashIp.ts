import crypto from 'crypto'

//hash ip address
export const hashData = (data: string): string => {
    return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex')
}