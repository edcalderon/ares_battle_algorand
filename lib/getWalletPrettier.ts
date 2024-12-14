export const walletPretier = (s: string, n: number) => {
    return `${s.slice(0, n)}...${s.slice(-n)}`
}