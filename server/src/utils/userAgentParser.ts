//parse the user agent to extract the browser
export const parseBrowser = (userAgent?: string):string => {
    if(!userAgent) {
        return "unknown"
    }
    const uagent = userAgent.toLowerCase()
    if(uagent.includes("firefox/")) return "Firefox"
    if(uagent.includes("edg/")) return "Microsoft Edge"
    if(uagent.includes("opr/")) return "Opera"
    if(uagent.includes("chrome/")) return "Chrome"
    if(uagent.includes("safari/")) return "Safari"
    
    return "other"
}