import OBR, { Theme } from "@owlbear-rodeo/sdk";
import { Constants } from "./constants";

let messageCounter: { [key: string]: string } = {};

export function GetGUID(): string
{
    let d = new Date().getTime();
    const guid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) =>
    {
        const r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return guid;
}
function hashCode(str: string): number
{
    let hash = 0;
    if (str.length === 0) return hash;

    for (let i = 0; i < str.length; i++)
    {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash &= hash; // Convert to 32bit integer
    }

    return hash;
}

export function stringToColor(str: string): string
{
    const hash = hashCode(str);
    const color = `hsl(${(hash % 360 + 360) % 360}, 70%, 60%)`; // Adjust the saturation and lightness as needed
    return color;
}

export function FindUniqueIds(array1: string[], array2: string[]): string[]
{
    const set1 = new Set(array1);
    const set2 = new Set(array2);

    const uniqueIds: string[] = [];

    for (const id of array1)
    {
        if (!set2.has(id))
        {
            uniqueIds.push(id);
        }
    }

    for (const id of array2)
    {
        if (!set1.has(id))
        {
            uniqueIds.push(id);
        }
    }

    return uniqueIds;
}

export function IsThisOld(timeStamp: string, processId: string, category = "CALENDAR"): boolean
{
    const processCategory = `${processId}_${category}}`;
    const logKey = messageCounter[processCategory];
    if (logKey)
    {
        if (logKey !== timeStamp)
        {
            // If it's older than a minute, we assume stale data.
            // If the app was reloaded we no longer have our list.
            const inputDate = new Date(timeStamp);
            const currentDate = new Date();
            const timeDifference = currentDate.getTime() - inputDate.getTime();
            const oneMinuteInMilliseconds = 60 * 1000;

            // In this case, this should only be coming from the same PC - so the time should be pretty accurate.
            if (timeDifference >= oneMinuteInMilliseconds)
            {
                return true;
            }
            messageCounter[processCategory] = timeStamp;
            return false;
        }
        else
            return true;
    }
    else
    {
        // If it's older than a minute, we assume stale data.
        // If the app was reloaded we no longer have our list.
        const inputDate = new Date(timeStamp);
        const currentDate = new Date();
        const timeDifference = currentDate.getTime() - inputDate.getTime();
        const oneMinuteInMilliseconds = 60 * 1000;

        // In this case, this should only be coming from the same PC - so the time should be pretty accurate.
        if (timeDifference >= oneMinuteInMilliseconds)
        {
            return true;
        }
        messageCounter[processCategory] = timeStamp;
        return false;
    }
}

export function HexToRgba(hex: string, alpha: number): string
{
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function SetThemeMode(theme: Theme, document: Document): void
{
    const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");

    const darkTheme = darkThemeMq.matches ? "dark" : "light";
    const lightTheme = darkThemeMq.matches ? "light" : "dark";

    for (var s = 0; s < document.styleSheets.length; s++)
    {
        for (var i = 0; i < document.styleSheets[s].cssRules.length; i++)
        {
            let rule = document.styleSheets[s].cssRules[i] as CSSMediaRule;

            if (rule && rule.media && rule.media.mediaText.includes("prefers-color-scheme"))
            {
                if (theme.mode == "LIGHT")
                {
                    rule.media.appendMedium(`(prefers-color-scheme: ${darkTheme})`);

                    if (rule.media.mediaText.includes(lightTheme))
                    {
                        rule.media.deleteMedium(`(prefers-color-scheme: ${lightTheme})`);
                    }
                }
                else if (theme.mode == "DARK")
                {
                    rule.media.appendMedium(`(prefers-color-scheme: ${lightTheme})`);

                    if (rule.media.mediaText.includes(darkTheme))
                    {
                        rule.media.deleteMedium(`(prefers-color-scheme: ${darkTheme})`);
                    }
                }
            }
        }
    }
}

export function areObjectsIdentical(obj1: any, obj2: any): boolean
{
    // Check if both parameters are objects
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object')
    {
        return false;
    }

    // Check if both objects have the same number of keys
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length)
    {
        return false;
    }

    // Check if all keys and values are identical
    for (const key of keys1)
    {
        const val1 = obj1[key];
        const val2 = obj2[key];

        // Recursively check nested objects
        if (typeof val1 === 'object' && typeof val2 === 'object')
        {
            if (!areObjectsIdentical(val1, val2))
            {
                return false;
            }
        } else if (val1 !== val2)
        {
            return false;
        }
    }

    // If all checks passed, the objects are identical
    return true;
}

export function GetWhatsNewButton()
{
    const newImgElement = document.createElement('img');
    newImgElement.id = "whatsNewButton";
    newImgElement.setAttribute('class', 'icon');
    newImgElement.classList.add('clickable');
    newImgElement.style.marginLeft = "10px";
    newImgElement.style.cursor = "pointer";
    newImgElement.setAttribute('title', 'Whats New?');
    newImgElement.setAttribute('src', '/info.svg');
    newImgElement.onclick = async function ()
    {
        try
        {
            localStorage.setItem(Constants.VERSION, "true");
            newImgElement.classList.remove('whats-new-shine');
        } catch (error)
        {
            // Oh well.
        }
        await OBR.modal.open({
            id: Constants.EXTENSIONWHATSNEW,
            url: `/bswhatsnew.html`,
            height: 500,
            width: 350,
        });
    };

    try
    {
        const glow = localStorage.getItem(Constants.VERSION);
        if (glow !== "true") newImgElement.classList.add('whats-new-shine');
    } catch (error)
    {
        // Oh well.
    }

    return newImgElement;
}