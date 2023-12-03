import OBR from '@owlbear-rodeo/sdk';
import * as Utilities from './utilities';
import './style.css'
import { Constants } from './constants';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<div id="floating-header">
  <button id="calendarButton" class="button-selected" (click)="toggleContent('calendar')">Calendar</button>
  <button (click)="toggleContent('months')">Months</button>
  <button (click)="toggleContent('days')">Days</button>
  <button (click)="toggleContent('moons')">Moons</button>
  <button (click)="toggleContent('import')">Import</button>
  <button id="generateCalendar">Generate</button>
</div>

<div id="calendar" class="content">
    <h2 id="titleLine"><div id="spellLevelContainer" style="display:none;"></div><div id="titleName">Calendar!</div><div id="profLevelContainer" style="display:none;"></div></h2>
    <div id="moonContainer"></div>
    <div id="calendarOutput"></div>
</div>

<div id="months" class="content" style="display:none;">
    <label for="calendarName">Calendar Name/Year:</label>
    <input type="text" id="calendarName" name="calendarName" value="Testers">
    </br>
    <label for="currentMonth">Current Month:</label>
    <input type="number" class="input-mini" id="currentMonth" name="currentMonth" value="1">
    </br>
    <label for="numMonths">Number of Months:</label>
    <input type="number" class="input-mini" id="numMonths" name="numMonths" min="1" value="12">
    <div id="monthInputContainer"></div>
</div>

<div id="days" class="content" style="display:none;">
    <label for="currentDay">Current Day:</label>
    <input type="number" class="input-mini" id="currentDay" name="currentDay" value="1">
    </br>
    <label for="daysPerWeek">Days per Week:</label>
    <input type="number" class="input-mini" id="daysPerWeek" name="daysPerWeek" min="1" value="7">
    <div id="dayNameInputContainer"></div>
        
    <label for="totalDaysInYear">Total Days in Year:</label>
    <input type="number" class="input-mini" id="totalDaysInYear" name="totalDaysInYear" min="1" value="365">
</div>

<div id="moons" class="content" style="display:none;">
    <label for="numMoons">Number of Moons:</label>
    <input type="number" class="input-mini" id="numMoons" name="numMoons" min="1" value="1">
    <div id="moonInputContainer"></div>
</div>

<div id="import" class="content" style="display:none;">
    <label for="donjonJson">DonJon Calendar Importer:</label>
    </br>
    <textarea id="donjonJson" rows="20" style="width: 100%;"></textarea>
    </br>
    <button id="importDonJon">Import DonJon Calendar</button>
</div>
`;

// calendar Inputs
const calendarNameInput = document.getElementById('calendarName') as HTMLInputElement;
const daysPerWeekInput = document.getElementById('daysPerWeek') as HTMLInputElement;
const monthInputContainer = document.getElementById('monthInputContainer') as HTMLDivElement;
const numMonthsInput = document.getElementById('numMonths') as HTMLInputElement
const dayNameInputContainer = document.getElementById('dayNameInputContainer') as HTMLDivElement;
const moonInputContainer = document.getElementById('moonInputContainer') as HTMLDivElement;
const moonNumberInput = document.getElementById('numMoons') as HTMLInputElement;
const generateButton = document.getElementById('generateCalendar')!;
const donJonButton = document.getElementById('importDonJon')!;
const calendarOutputContainer = document.getElementById('calendarOutput') as HTMLDivElement;
const calendarSelectButton = document.getElementById('calendarButton') as HTMLButtonElement;
const generateCalendarButton = document.getElementById('generateCalendar') as HTMLButtonElement;
const headlineArea = document.getElementById('titleName') as HTMLElement;

const spellContainer = document.getElementById('spellLevelContainer') as HTMLDivElement;
const spellLabel = document.createElement('div');
let spellDCValue: number = 0;
spellLabel.textContent = "SpellLevel: ";
spellLabel.classList.add('moon-phase-label');
spellLabel.style.marginTop = "4px";
spellContainer?.appendChild(spellLabel);
const spellInput = document.createElement('input');
spellInput.id = "spellInput";
spellInput.type = 'number';
spellInput.classList.add('moon-mage-stuff');
spellInput.onchange = (event) =>
{
    const target = event.target as HTMLInputElement;
    const value = +target.value;
    switch (value)
    {
        case 0:
            spellDCValue = 0;
            break;
        case 1:
            spellDCValue = 0;
            break;
        case 2:
            spellDCValue = 2;
            break;
        case 3:
            spellDCValue = 4;
            break;
        case 4:
            spellDCValue = 6;
            break;
        case 5:
            spellDCValue = 8;
            break;
        default:
            spellDCValue = 8;
            break;
    }

    const dcElements = document.querySelectorAll<HTMLLabelElement>('.moon-dc-label');
    for (const element of dcElements)
    {
        const baseCheck = +(element.getAttribute('data-dc')!);
        element.textContent = `Spell DC: ${(baseCheck + spellDCValue).toString()}`;
    }
};
spellContainer?.appendChild(spellInput);

const profContainer = document.getElementById('profLevelContainer') as HTMLDivElement;
const profLabel = document.createElement('div');
profLabel.textContent = "Proficiency: ";
profLabel.classList.add('moon-phase-label');
profLabel.style.marginTop = "4px";
profContainer?.appendChild(profLabel);
const profInput = document.createElement('input');
profInput.id = "profInput";
profInput.type = 'number';
profInput.classList.add('moon-mage-stuff');
profContainer?.appendChild(profInput);

const moonContainer = document.getElementById('moonContainer') as HTMLElement;

const currentDayInput = document.getElementById('currentDay')! as HTMLInputElement;
const currentMonthInput = document.getElementById('currentMonth')! as HTMLInputElement;

OBR.onReady(async () =>
{
    // Set theme accordingly
    const theme = await OBR.theme.getTheme();
    Utilities.SetThemeMode(theme, document);
    OBR.theme.onChange((theme) =>
    {
        Utilities.SetThemeMode(theme, document);
    })

    const userRole = await OBR.player.getRole();
    // Load data no matter who
    const roomData = await OBR.room.getMetadata();
    const oldSave = roomData[`${Constants.EXTENSIONID}/saveData`] as SaveFile;

    // On Load
    addMoonInput();
    updateMonthInputs();
    updateDayInputs();

    if (oldSave)
    {
        importCalendarData(oldSave);
    }

    if (userRole === "PLAYER")
    {
        document.getElementById("floating-header")!.style.display = "none";
        document.getElementById("calendar")!.style.marginTop = "0";
        OBR.room.onMetadataChange((metadata) =>
        {
            const saveData = metadata[`${Constants.EXTENSIONID}/saveData`] as SaveFile;
            if (saveData)
            {
                importCalendarData(saveData);
            }
        });
        return;
    }

    const buttons = document.querySelectorAll('#floating-header button');
    const contents = document.querySelectorAll<HTMLDivElement>('.content');

    buttons.forEach((button) =>
    {
        button.addEventListener('click', function ()
        {
            let targetContentId = button.textContent?.toLowerCase();

            if (targetContentId === "generate") targetContentId = "calendar";

            if (targetContentId)
            {
                contents.forEach((content) =>
                {
                    content.style.display = content.id === targetContentId ? 'block' : 'none';
                });

                // Remove the 'button-selected' class from all buttons
                buttons.forEach((btn) =>
                {
                    btn.classList.remove('button-selected');
                });

                // Add the 'button-selected' class to the clicked button
                if (button === generateCalendarButton)
                {
                    calendarSelectButton.classList.add('button-selected');
                }
                else
                {
                    button.classList.add('button-selected');
                }
            }
        });
    });

    currentMonthInput.onchange = () => setCurrentDate();
    currentDayInput.onchange = () => setCurrentDate();

    // Setup Onclicks
    generateButton.onclick = () => generateCalendar();
    donJonButton.onclick = () => importCalendarData();

    // Setup Onchange Handlers
    daysPerWeekInput.onchange = () => updateDayInputs();
    moonNumberInput.onchange = () => addMoonInput();
    numMonthsInput.onchange = () => updateMonthInputs();

    function updateMonthInputs()
    {
        // Clear existing month input fields
        monthInputContainer.innerHTML = '';

        for (let i = 1; i <= (+numMonthsInput.value); i++)
        {
            const monthDiv = document.createElement('div');
            monthDiv.innerHTML = `
            <label for="month${i}Name">Name ${i}:</label>
            <input type="text" id="month${i}Name" name="month${i}Name" value="Month${i}">
    
            <label for="month${i}Days">Days:</label>
            <input type="number" class="input-mini" id="month${i}Days" name="month${i}Days" min="1" value="30">
          `;
            monthInputContainer.appendChild(monthDiv);
        }
    }

    function updateDayInputs()
    {
        // Clear existing day name input fields
        dayNameInputContainer.innerHTML = '';

        for (let i = 1; i <= (+daysPerWeekInput.value); i++)
        {
            const dayNameDiv = document.createElement('div');
            dayNameDiv.innerHTML = `
            <label for="day${i}Name">Day ${i} Name:</label>
            <input type="text" id="day${i}Name" name="day${i}Name" value="Day${i}">
          `;
            dayNameInputContainer.appendChild(dayNameDiv);
        }
    }

    function addMoonInput()
    {
        // Clear existing moon input fields
        moonInputContainer.innerHTML = '';

        for (let i = 1; i <= (+moonNumberInput.value); i++)
        {
            const moonDiv = document.createElement('div');
            moonDiv.innerHTML = `
            <label for="moon${i}Name">Name ${i}:</label>
            <input type="text" class="moon-input" id="moon${i}Name" name="moon${i}Name" value="Moon${i}">
    
            <label for="moon${i}Cycle">Cycle ${i} (days):</label>
            <input type="number" class="input-mini" id="moon${i}Cycle" name="moon${i}Cycle" min="1" value="30">
    
            <label for="moon${i}Shift">Shift ${i}:</label>
            <input type="number" class="input-mini" id="moon${i}Shift" name="moon${i}Shift" min="0" value="0">
          `;
            moonInputContainer.appendChild(moonDiv);
        }
    }

    function GetSpecialValue(category: "month" | "day" | "moon", index: number, type: "Name" | "Days" | "Cycle" | "Shift")
    {
        return (document.getElementById(`${category}${index}${type}`) as HTMLInputElement).value;
    }

    async function generateCalendar()
    {
        // Get month names and days
        const monthNames = [];
        const monthDays = [];
        for (let i = 1; i <= (+numMonthsInput.value); i++)
        {
            const monthName = GetSpecialValue("month", i, "Name");
            const monthDay = GetSpecialValue("month", i, "Days");
            monthNames.push(monthName);
            monthDays.push(monthDay);
        }

        // Get day names
        const dayNames = [];
        for (let i = 1; i <= (+daysPerWeekInput.value); i++)
        {
            const dayName = GetSpecialValue("day", i, "Name");
            dayNames.push(dayName);
        }

        // Create the calendar container
        const calendarContainer = document.createElement('div');
        calendarContainer.classList.add('calendar-system-container');

        // Create Day Toggles
        const dayBackButton = document.createElement('button');
        dayBackButton.title = "DayBack";
        dayBackButton.classList.add("day-back-button");
        dayBackButton.style.background = "url(./back-day.svg) no-repeat center center";
        dayBackButton.style.backgroundSize = 'contain';
        dayBackButton.onclick = () =>
        {
            currentDayInput.value = (+currentDayInput.value - 1).toString();
            setCurrentDate();
        };
        const dayForwardButton = document.createElement('button');
        dayForwardButton.title = "DayForward";
        dayForwardButton.classList.add("day-forward-button");
        dayForwardButton.style.background = "url(./forward-day.svg) no-repeat center center";
        dayForwardButton.style.backgroundSize = 'contain';
        dayForwardButton.onclick = () =>
        {
            currentDayInput.value = (+currentDayInput.value + 1).toString();
            setCurrentDate();
        };

        // Add calendar name as the caption
        headlineArea.innerHTML = "";
        if (userRole === "GM") headlineArea.appendChild(dayBackButton);
        headlineArea.appendChild(document.createTextNode(calendarNameInput.value));
        if (userRole === "GM") headlineArea.appendChild(dayForwardButton);

        // Create a table for each month
        for (let monthIndex = 0; monthIndex < (+numMonthsInput.value); monthIndex++)
        {
            const monthBackButton = document.createElement('button');
            monthBackButton.title = "MonBack";
            monthBackButton.classList.add("mon-back-button");
            monthBackButton.style.background = "url(./back-month.svg) no-repeat center center";
            monthBackButton.style.backgroundSize = 'contain';
            monthBackButton.onclick = () =>
            {
                currentMonthInput.value = (Math.max(+currentMonthInput.value - 1, 1)).toString();
                changeVisibleMonth();
            };
            const monthForwardButton = document.createElement('button');
            monthForwardButton.title = "MonForward";
            monthForwardButton.classList.add("mon-forward-button");
            monthForwardButton.style.background = "url(./forward-month.svg) no-repeat center center";
            monthForwardButton.style.backgroundSize = 'contain';
            monthForwardButton.onclick = () =>
            {
                currentMonthInput.value = (Math.max(+currentMonthInput.value + 1, 1)).toString();
                changeVisibleMonth();
            };

            const monthTable = document.createElement('table');
            monthTable.classList.add('calendar-system');
            monthTable.id = `monthTable${monthIndex}`;

            // Add month header
            const monthName = monthNames[monthIndex] ? monthNames[monthIndex] : `Month ${(monthIndex + 1).toString()}`;

            const monthHeaderRow = monthTable.insertRow();
            monthHeaderRow.classList.add("month-row");
            const monthHeaderCell = monthHeaderRow.insertCell();
            monthHeaderCell.classList.add("month-header-cell");

            monthHeaderCell.appendChild(monthBackButton);
            monthHeaderCell.appendChild(document.createTextNode(monthName));
            monthHeaderCell.appendChild(monthForwardButton);

            monthHeaderCell.colSpan = (+daysPerWeekInput.value); // No +1 here, since we have a separate header row

            // Add day headers
            const dayHeaderRow = monthTable.insertRow();
            for (const dayName of dayNames)
            {
                const dayHeaderCell = dayHeaderRow.insertCell();
                dayHeaderCell.textContent = dayName;
                dayHeaderCell.classList.add("day-header");
            }

            // Add day cells with moon phases
            let currentWeekday = 1;
            for (let day = 1; day <= (+monthDays[monthIndex]); day++)
            {
                if (currentWeekday === 1)
                {
                    // Start a new row for the first day of the week
                    monthTable.insertRow();
                }

                const dayRow = monthTable.rows[monthTable.rows.length - 1];
                const dayCell = dayRow.insertCell();
                dayCell.textContent = `${day}`;
                dayCell.setAttribute('data-month', (monthIndex + 1).toString());
                dayCell.setAttribute('data-day', day.toString());
                dayCell.classList.add("day-cell");

                // Increment the currentWeekday counter
                currentWeekday++;

                // If we reached the last weekday, reset the counter for a new week
                if (currentWeekday > (+daysPerWeekInput.value))
                {
                    currentWeekday = 1;
                }
            }

            // Add the month table to the calendar container
            calendarContainer.appendChild(monthTable);
        }

        // Display the generated calendar container
        calendarOutputContainer.innerHTML = '';
        calendarOutputContainer.appendChild(calendarContainer);

        await setCurrentDate();
    }

    function CreateSaveFile()
    {
        // Get days data
        const days = [];
        for (let i = 1; i <= (+daysPerWeekInput.value); i++)
        {
            const dayName = GetSpecialValue("day", i, "Name");
            days.push(dayName);
        }

        // Get month data
        const months: Month[] = [];
        for (let i = 1; i <= (+numMonthsInput.value); i++)
        {
            const monthName = GetSpecialValue("month", i, "Name");
            const monthDay = GetSpecialValue("month", i, "Days");
            months.push({ Name: monthName, Days: monthDay });
        }

        // Get moon data
        const moons: Moon[] = [];
        for (let i = 1; i <= (+moonNumberInput.value); i++)
        {
            const moonName = GetSpecialValue("moon", i, "Name");
            const moonCycle = GetSpecialValue("moon", i, "Cycle");
            const moonShift = GetSpecialValue("moon", i, "Shift");
            moons.push({
                Name: moonName,
                Cycle: moonCycle,
                Shift: moonShift,
            });
        }

        // Package up for Saving
        const saveData: SaveFile = {
            NameYear: calendarNameInput.value,
            CurrentDay: currentDayInput.value,
            CurrentMonth: currentMonthInput.value,
            NumberMonth: numMonthsInput.value,
            DaysPerWeek: daysPerWeekInput.value,
            NumberMoons: moonNumberInput.value,
            MoonSet: moons,
            MonthSet: months,
            DaySet: days
        };
        return saveData;
    }

    function changeVisibleMonth()
    {
        // Find all elements with the class 'calendar-system'
        const calendarElements = document.querySelectorAll<HTMLTableElement>('.calendar-system');

        // Loop through each element
        for (const calendarElement of calendarElements)
        {
            const monthValue = (+currentMonthInput.value) - 1;
            // Check if the element has the id 'testers1'
            if (calendarElement.id === `monthTable${monthValue}`)
            {
                // Display the element with id 'testers1'
                calendarElement.style.display = 'table';
            } else
            {
                // Hide other elements with class 'calendar-system'
                calendarElement.style.display = 'none';
            }
        }
    }

    async function setCurrentDate()
    {
        const daysInMonthMax = GetSpecialValue("month", +currentMonthInput.value, "Days");

        if ((+currentDayInput.value) > (+daysInMonthMax))
        {
            let newMonthInput = (+currentMonthInput.value + 1);
            if (newMonthInput > (+numMonthsInput.value))
            {
                currentDayInput.value = "1";
                currentMonthInput.value = "1";
            }
            else
            {
                currentMonthInput.value = newMonthInput.toString();
                currentDayInput.value = "1";
            }
        }
        else if ((+currentDayInput.value) < 1)
        {
            let newMonthInput = (+currentMonthInput.value - 1);
            if (newMonthInput < 1)
            {
                const previousDaysInMonthMax = GetSpecialValue("month", +numMonthsInput.value - 1, "Days");
                currentDayInput.value = previousDaysInMonthMax;
                currentMonthInput.value = numMonthsInput.value;
            }
            else
            {
                const previousDaysInMonthMax = GetSpecialValue("month", newMonthInput, "Days");
                currentMonthInput.value = (+currentMonthInput.value - 1).toString();
                currentDayInput.value = previousDaysInMonthMax;
            }
        }



        // Remove the current date style from all cells
        const allCells = document.querySelectorAll('.calendar-system td');
        allCells.forEach(cell => cell.classList.remove('current-date'));

        // Add the current date style to the specified cell
        const currentDateCell = document.querySelector(`.calendar-system td[data-month="${currentMonthInput.value}"][data-day="${currentDayInput.value}"]`);
        if (currentDateCell)
        {
            currentDateCell.classList.add('current-date');
        }
        changeVisibleMonth();

        // Get moon data
        const moons = [];
        for (let i = 1; i <= (+moonNumberInput.value); i++)
        {
            const moonName = GetSpecialValue("moon", i, "Name");
            const moonCycle = GetSpecialValue("moon", i, "Cycle");
            const moonShift = GetSpecialValue("moon", i, "Shift");
            moons.push({
                name: moonName,
                cycle: moonCycle,
                shift: moonShift,
            });
        }

        // Add moon phases for that day
        moonContainer.innerHTML = "";
        for (const moon of moons)
        {
            const moonPhase = getMoonPhase(+currentDayInput.value, (+moon.cycle), (+moon.shift), moon.name);
            moonContainer.appendChild(moonPhase);
        }

        if (userRole === "GM")
        {
            const saveData = CreateSaveFile();
            await OBR.room.setMetadata({ [`${Constants.EXTENSIONID}/saveData`]: saveData });
        }
    }

    function getMoonPhase(dayNumber: number, cycle: number, shift: number, name: string)
    {
        const totalDays = dayNumber + shift - 1; // Adjusted for 1-based indexing
        const fractionalPhase = (totalDays % cycle) / cycle; // Fractional part of the cycle

        let phase: string;
        let phaseName: string;
        let phaseCheck: string;

        // Map the fractional phase to one of the eight phases
        if (fractionalPhase < 0.0625 || fractionalPhase >= 0.9375)
        {
            phase = "/new_moon.png";
            phaseName = "New Moon";
            phaseCheck = "20";
        } else if (fractionalPhase < 0.1875)
        {
            phase = "/waxing_crescent.png";
            phaseName = "Waxing Crescent";
            phaseCheck = "15";
        } else if (fractionalPhase < 0.3125)
        {
            phase = "/first_quarter.png";
            phaseName = "First Quarter";
            phaseCheck = "10";
        } else if (fractionalPhase < 0.4375)
        {
            phase = "/waxing_gibbous.png";
            phaseName = "Waxing Gibbous";
            phaseCheck = "8";
        } else if (fractionalPhase < 0.5625)
        {
            phase = "/full_moon.png";
            phaseName = "Full Moon";
            phaseCheck = "5";
        } else if (fractionalPhase < 0.6875)
        {
            phase = "/waning_gibbous.png";
            phaseName = "Waning Gibbous";
            phaseCheck = "8";
        } else if (fractionalPhase < 0.8125)
        {
            phase = "/third_quarter.png";
            phaseName = "Third Quarter";
            phaseCheck = "10";
        } else
        {
            phase = "/waning_crescent.png";
            phaseName = "Waning Crescent";
            phaseCheck = "15";
        }

        let moonColor = Utilities.stringToColor(name);
        switch (name)
        {
            case "Katamba":
                moonColor = "#000000";
                break;
            case "Yavash":
                moonColor = "#FF0000";
                break;
            case "Xibar":
                moonColor = "#739BD0";
                break;
            default:
                break;
        }
        const entireContainer = document.createElement('div');

        const tintContainer = document.createElement('section');
        tintContainer.classList.add('moon-icon');
        tintContainer.style.setProperty('--moon-color', moonColor);

        const labelName = document.createElement('label');
        labelName.textContent = name;
        labelName.classList.add("moon-name-label");

        const labelDC = document.createElement('label');
        labelDC.textContent = `Spell DC: ${(+phaseCheck) + spellDCValue}`;
        labelDC.setAttribute('data-dc', phaseCheck);
        labelDC.classList.add("moon-dc-label");

        const labelPhase = document.createElement('label');
        labelPhase.textContent = phaseName;
        labelPhase.classList.add("moon-phase-label");

        const moonNode = document.createElement('img');
        moonNode.src = phase;
        moonNode.classList.add("moon-image");
        moonNode.title = name;
        tintContainer.appendChild(moonNode);

        entireContainer.appendChild(labelPhase);
        entireContainer.appendChild(tintContainer);
        entireContainer.appendChild(labelName);
        if (name === "Xibar" || name === "Katamba" || name === "Yavash")
        {
            entireContainer.appendChild(document.createElement('br'));
            entireContainer.appendChild(labelDC);
            spellContainer.style.display = "block";
            profContainer.style.display = "block";
        }
        return entireContainer;
    }

    // Don Jon Importer
    function importCalendarData(saveFile?: SaveFile)
    {
        const donjonJson = (document.getElementById('donjonJson') as HTMLTextAreaElement).value;
        let donjonData;
        try
        {
            if (saveFile)
            {
                donjonData = translateSaveFileToDonJonData(saveFile);
                currentMonthInput.value = saveFile.CurrentMonth;
                currentDayInput.value = saveFile.CurrentDay;
            }
            else
            {
                donjonData = JSON.parse(donjonJson);
            }

            // Set the calendar name
            calendarNameInput.value = donjonData.year ? donjonData.year : "Default Calendar Name";

            // Set the number of months and update the month inputs
            numMonthsInput.value = donjonData.n_months ? donjonData.n_months : "12";
            updateMonthInputs();

            // Set the month names and days
            for (let i = 1; i <= donjonData.n_months; i++)
            {
                (document.getElementById(`month${i}Name`) as HTMLInputElement).value = donjonData.months[i - 1] ? donjonData.months[i - 1] : `DefaultMonth#${i}`;
                (document.getElementById(`month${i}Days`) as HTMLInputElement).value = donjonData.month_len[donjonData.months[i - 1]] ? donjonData.month_len[donjonData.months[i - 1]] : "28";
            }

            // Set the number of days per week and update the day inputs
            (document.getElementById('daysPerWeek') as HTMLInputElement).value = donjonData.weekdays.length > 0 ? donjonData.weekdays.length : "7";
            updateDayInputs();

            // Set the day names
            for (let i = 1; i <= donjonData.weekdays.length; i++)
            {
                (document.getElementById(`day${i}Name`) as HTMLInputElement).value = donjonData.weekdays[i - 1] ? donjonData.weekdays[i - 1] : `DefaultDay#${i}`;
            }

            // Set the number of moons and add moon inputs
            (document.getElementById('numMoons') as HTMLInputElement).value = donjonData.n_moons ? donjonData.n_moons : "2";
            addMoonInput();

            // Set the moon names, cycles, and shifts
            for (let i = 1; i <= donjonData.n_moons; i++)
            {
                (document.getElementById(`moon${i}Name`) as HTMLInputElement).value = donjonData.moons[i - 1] ? donjonData.moons[i - 1] : `DefaultMoon#${i}`;
                (document.getElementById(`moon${i}Cycle`) as HTMLInputElement).value = donjonData.lunar_cyc[donjonData.moons[i - 1]] ? donjonData.lunar_cyc[donjonData.moons[i - 1]] : `28`;
                (document.getElementById(`moon${i}Shift`) as HTMLInputElement).value = donjonData.lunar_shf[donjonData.moons[i - 1]] ? donjonData.lunar_shf[donjonData.moons[i - 1]] : `0`;
            }

            // Set the total days in the year
            (document.getElementById('totalDaysInYear') as HTMLInputElement).value = donjonData.year_len ? donjonData.year_len : "336";

            generateCalendar();
        } catch (error)
        {
            alert('Invalid Calendar Format.');
            console.error(error);
        }
    }

    function translateSaveFileToDonJonData(saveFile: SaveFile): any
    {
        const donjonData: any = {};

        // Set the calendar name
        donjonData.year = saveFile.NameYear || "Default Calendar Name";

        // Set the number of months and update the month inputs
        donjonData.n_months = saveFile.NumberMonth || "12";

        // Set the month names and days
        donjonData.months = [];
        donjonData.month_len = {};
        saveFile.MonthSet.forEach((month, index) =>
        {
            donjonData.months[index] = month.Name || `DefaultMonth#${index + 1}`;
            donjonData.month_len[donjonData.months[index]] = month.Days || "28";
        });

        // Set the number of days per week and update the day inputs
        donjonData.weekdays = saveFile.DaySet || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

        // Set the day names
        donjonData.weekdays.forEach((day: string, index: number) =>
        {
            donjonData.weekdays[index] = day || `DefaultDay#${index + 1}`;
        });

        // Set the number of moons and add moon inputs
        donjonData.n_moons = saveFile.NumberMoons || "2";

        // Set the moon names, cycles, and shifts
        donjonData.moons = [];
        donjonData.lunar_cyc = {};
        donjonData.lunar_shf = {};
        saveFile.MoonSet.forEach((moon, index) =>
        {
            donjonData.moons[index] = moon.Name || `DefaultMoon#${index + 1}`;
            donjonData.lunar_cyc[donjonData.moons[index]] = moon.Cycle || "28";
            donjonData.lunar_shf[donjonData.moons[index]] = moon.Shift || "0";
        });

        // Set the total days in the year
        donjonData.year_len = saveFile.DaysPerWeek || "336";

        return donjonData;
    }
});