import OBR, { Item, Image as OBRImage, Theme, Vector2 } from "@owlbear-rodeo/sdk";
import { BSCACHE } from "./bsSceneCache";
import { Constants } from "./bsConstants";

// Keep the Chronicle header at the top
export async function RequestData(requestUrl: string, requestPackage: any): Promise<BSData | void>
{
    try
    {
        const debug = window.location.origin.includes("localhost") ? "eternaldream" : "";

        const requestOptions = {
            method: "POST",
            headers: new Headers({
                "Content-Type": "application/json",
                "Authorization": Constants.ANONAUTH,
                "x-manuel": debug
            }),
            body: JSON.stringify(requestPackage),
        };
        const response = await fetch(requestUrl, requestOptions);

        const data = await response.json();
        if (!response.ok)
        {
            // Handle error data
            await OBR.notification.show("There was an error retrieving your data, please refresh the page. If this issue persists, wait a few minutes as the server could be experiences difficulties.");
            console.error("Error:", data);
        }
        else
        {
            return data;
        }
    }
    catch (error)
    {
        // Handle errors
        await OBR.notification.show("There was an error retrieving your data, please refresh the page. If this issue persists, wait a few minutes as the server could be experiences difficulties.");
        console.error("Error:", error);
    }
}

export function SetupSticky(): void
{
    const header = document.getElementById("superContainer")!;
    const sheetContainer = document.getElementById("sheetContainer")!;

    if (window.scrollY !== 0)
    {
        header.classList.add("sticky");
        sheetContainer.classList.add("padded");
    } else
    {
        header.classList.remove("sticky");
        sheetContainer.classList.remove("padded");
    }
}

export function stringToColor(str: string): string
{
    const hash = hashCode(str);
    const color = `hsl(${(hash % 360 + 360) % 360}, 70%, 60%)`; // Adjust the saturation and lightness as needed
    return color;
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

export function GetWhatsNewButton()
{
    const newImgElement = document.createElement('img');
    newImgElement.id = "whatsNewButton";
    newImgElement.style.cursor = "pointer";
    newImgElement.setAttribute('class', 'icon');
    newImgElement.classList.add('clickable');
    newImgElement.setAttribute('title', 'Whats New?');
    newImgElement.setAttribute('src', '/w-info.svg');
    newImgElement.onclick = async function ()
    {
        await OBR.modal.open({
            id: Constants.EXTENSIONWHATSNEW,
            url: `/bswhatsnew.html?subscriber=${BSCACHE.USER_REGISTERED}`,
            height: 500,
            width: 350,
        });
    };

    return newImgElement;
}
export function arraysAreEqual(array1: string[], array2: string[])
{
    if (array1.length !== array2.length)
    {
        return false;
    }

    for (let i = 0; i < array1.length; i++)
    {
        if (array1[i] !== array2[i])
        {
            return false;
        }
    }

    return true;
}
export function removeExtraWhitespace(inputString: string): string
{
    return inputString.replace(/\s+/g, ' ').trim();
}

export function isImageURL(url: string): boolean
{
    // Define a list of common image file extensions
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"];

    // Extract the file extension from the URL
    const fileExtension = url.split(".").pop().toLowerCase();

    // Check if the file extension is in the list of image extensions
    return imageExtensions.includes(fileExtension);
}
export function RandomNumber(min: number, max: number)
{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
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
export function WithinDistance(first: Vector2, second: Vector2, distance: number)
{
    const dx = first.x - second.x;
    const dy = first.y - second.y;
    const result = Math.sqrt(dx * dx + dy * dy);
    return result <= distance;
}
export function ShuffleArray(array: any[])
{
    for (let i = array.length - 1; i > 0; i--)
    {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}
export function GetImageExtension(url: string): string
{
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;
    const extension = pathname.split('.').pop();
    return extension ? extension : '';
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

export function HexToRgba(hex: string, alpha: number): string
{
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function Debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void
{
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    return function debounced(...args: Parameters<T>): void
    {
        if (timeoutId)
        {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() =>
        {
            func(...args);
            timeoutId = undefined;
        }, delay);
    };
}
export function calculateScale(originalWidth: number, originalHeight: number): Vector2
{
    const targetWidth = 234;
    const targetHeight = 333;
    const scaleX = targetWidth / originalWidth;
    const scaleY = targetHeight / originalHeight;

    return { x: scaleX, y: scaleY };
}
export function getImageDimensions(imageUrl: string): Promise<Vector2>
{
    return new Promise((resolve, reject) =>
    {
        const img = new Image();
        img.onload = () =>
        {
            const dimensions: Vector2 = { x: img.naturalWidth, y: img.naturalHeight };
            resolve(dimensions);
        };
        img.onerror = (error) =>
        {
            reject(error);
        };
        img.src = imageUrl;
    });
}

export function isObjectEmpty(obj: Record<string, any>): boolean
{
    for (const key in obj)
    {
        if (obj.hasOwnProperty(key))
        {
            return false;
        }
    }
    return true;
}

export function TestEnvironment()
{
    try
    {
        localStorage.setItem("STORAGECHECK", "test");
    }
    catch (error)
    {
        const storageWarningElement = document.getElementById("localStorageWarning")!;
        storageWarningElement.innerText = "Local Storage disabled. Some features will not function.";
    }
}

export function evaluateMathExpression(command: string): number | string
{
    // Remove the "/math" part and any leading/trailing whitespaces
    const expression = command.replace("/math", "").trim();

    // Validate the expression
    const validExpressionRegex = /^[-+*/()\d\s]+$/;
    if (!validExpressionRegex.test(expression))
    {
        return "That's not math. (Invalid expression.)";
    }

    try
    {
        // Evaluate the expression using the eval() function
        const result = eval(expression);
        return `The answer to ${expression} is ${result}.`;
    }
    catch (e)
    {
        return `Error: ${e}`;
    }
}

export function TruncateName(name: string): string
{
    if (name.length > 30)
    {
        return name.substring(0, 30) + "...";
    }
    return name;
}

export function InvertColor(hex: string)
{
    const bw = true;
    if (hex.indexOf('#') === 0)
    {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3)
    {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6)
    {
        throw new Error('Invalid HEX color.');
    }
    var r: any = parseInt(hex.slice(0, 2), 16),
        g: any = parseInt(hex.slice(2, 4), 16),
        b: any = parseInt(hex.slice(4, 6), 16);
    if (bw)
    {
        // https://stackoverflow.com/a/3943023/112731
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
    }
    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    return "#" + padZero(r) + padZero(g) + padZero(b);
}

function padZero(str: string, len: number = 0)
{
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}

export function ColorName(name: string): string
{
    if (!name || name === "")
    {
        return "white";
    }

    const letter = name.substring(0, 1).toLowerCase();
    switch (letter)
    {
        case "a":
        case "e":
        case "i":
        case "o":
        case "u":
            return "red";
        case "b":
        case "c":
        case "d":
            return "pink";
        case "f":
        case "g":
        case "h":
            return "cyan";
        case "j":
        case "k":
        case "l":
        case "m":
            return "#747bff"; //purple
        case "n":
        case "p":
        case "q":
            return "green";
        case "r":
        case "s":
        case "t":
        case "v":
            return "orange";
        case "w":
        case "x":
        case "y":
        case "z":
            return "yellow";
        default:
            return "white";
    }
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

export function GetImageBounds(item: OBRImage, dpi: any)
{
    const dpiScale = dpi / item.grid.dpi;
    const width = item.image.width * dpiScale * item.scale.x;
    const height = item.image.height * dpiScale * item.scale.y;
    const offsetX = (item.grid.offset.x / item.image.width) * width;
    const offsetY = (item.grid.offset.y / item.image.height) * height;
    const min = {
        x: item.position.x - offsetX,
        y: item.position.y - offsetY,
    };
    const max = { x: min.x + width, y: min.y + height };
    return { min, max };
}

export function Meta(unit: Item, key: string): any
{
    return unit.metadata[key] as any;
}

export function Reta(key: string): any
{
    return BSCACHE.roomMetadata[key] as any;
}

export function Seta(key: string): any
{
    return BSCACHE.sceneMetadata[key] as any;
}

function manhattanDistance(coord1, coord2)
{
    return Math.abs(coord1.x - coord2.x) + Math.abs(coord1.y - coord2.y);
}

// Function to check if two coordinates are within 5 squares of each other
export function withinDistance(coord1, coord2, range: number)
{
    return manhattanDistance(coord1, coord2) <= range;
}
