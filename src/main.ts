import OBR from '@owlbear-rodeo/sdk';
import * as Utilities from './bsUtilities';
import { Constants } from './bsConstants';
import { BSCACHE } from './bsSceneCache';
import './style.css'

async function BeginCalendar()
{
    await BSCACHE.InitializeCache();
    await CALENDAR.InitializeCalendar();
    BSCACHE.SetupHandlers();
}

OBR.onReady(async () =>
{
    await BeginCalendar();
});

class CalendarMain
{
    TABCONTROLS = document.getElementById('tabControls') as HTMLDivElement;
    MAINPANEL = document.getElementById('calendarPanel') as HTMLDivElement;
    MAINBUTTON = document.getElementById('calendarButton') as HTMLButtonElement;
    MOONCONTAINER = document.getElementById('calendarMoonContainer') as HTMLDivElement;
    CALENDARCONTAINER = document.getElementById('calendarContainer') as HTMLDivElement;

    TITLECONTAINER = document.getElementById('calendarTitleContainer') as HTMLDivElement;

    CONFIGPANEL = document.getElementById('configPanel') as HTMLDivElement;
    CONFIGBUTTON = document.getElementById('configButton') as HTMLButtonElement;
    CONFIGNAMEINPUT = document.getElementById('configName') as HTMLInputElement;

    CONFIGMONTHINPUT = document.getElementById('configMonth') as HTMLInputElement;
    CONFIGMONTHSNUMINPUT = document.getElementById('configMonthsNum') as HTMLInputElement;
    CONFIGMONTHSINPUTCONTAINER = document.getElementById('configMonthInputContainer') as HTMLDivElement;

    CONFIGDAYSPERWEEKINPUT = document.getElementById('configDaysPerWeek') as HTMLInputElement;
    CONFIGDAYSYEARSTARTINPUT = document.getElementById('configDaysYearStart') as HTMLInputElement;
    CONFIGDAYCURRENTINPUT = document.getElementById('configDayCurrent') as HTMLInputElement;
    CONFIGDAYSINYEARINPUT = document.getElementById('configDaysInYear') as HTMLInputElement;
    CONFIGDAYSINWEEKCONTAINER = document.getElementById('configDayNameContainer') as HTMLDivElement;

    CONFIGMOONSNUMINPUT = document.getElementById('configMoonsNum') as HTMLInputElement;
    CONFIGMOONSINPUTCONTAINER = document.getElementById('configMoonsInputContainer') as HTMLDivElement;

    GENERATEBUTTON = document.getElementById('generateCalendar') as HTMLButtonElement;

    IMPORTPANEL = document.getElementById('importPanel') as HTMLDivElement;
    IMPORTBUTTON = document.getElementById('importButton') as HTMLButtonElement;
    IMPORTTEXTINPUT = document.getElementById('importTextInput') as HTMLTextAreaElement;
    IMPORTCONFIRMBUTTON = document.getElementById('importConfirmButton') as HTMLButtonElement;

    WHATSNEWCONTAINER = document.getElementById("whatsNew") as HTMLDivElement;
    SPELLPROFINPUT = document.getElementById("calendarProfContainer") as HTMLDivElement;
    SPELLDCINPUT = document.getElementById("calendarSpellContainer") as HTMLDivElement;

    roomSavedData: SaveFile;
    savedDateActionText = "";
    disableBadgeText = false;
    debouncedSaveData: any;

    viewingMonth = 1;
    shownMonth = 1;
    spellDCValue = 1;

    constructor()
    {
        this.roomSavedData = {} as any;
        this.debouncedSaveData = Utilities.Debounce(this.SaveData, 1000);
    }

    public async InitializeCalendar()
    {
        if (BSCACHE.playerRole === "PLAYER")
        {
            this.TABCONTROLS.style.display = "none";
            this.MAINPANEL.style.height = "100%";
        }
        await this.SetupCalendar();
    }

    public async SetupCalendar()
    {
        if (BSCACHE.savedData)
        {
            await this.ImportCalendarData(BSCACHE.savedData);
        }
        else
        {
            this.AddDayInputs();
            this.AddMonthInputs();
            this.AddMoonInput();
            await this.GenerateCalendar();
        }
        this.WHATSNEWCONTAINER.appendChild(Utilities.GetWhatsNewButton());
        this.SetupTabControls();
        this.SetupOnChangeEvents();
        this.SetupMoonMagic();
    }

    private SetupOnChangeEvents()
    {
        this.CONFIGDAYSPERWEEKINPUT.onchange = async () => await this.SetCurrentDate();
        this.CONFIGDAYCURRENTINPUT.onchange = async () => await this.SetCurrentDate();

        this.CONFIGDAYSPERWEEKINPUT.onchange = () => this.AddDayInputs();
        this.CONFIGMOONSNUMINPUT.onchange = () => this.AddMoonInput();
        this.CONFIGMONTHSNUMINPUT.onchange = () => this.AddMonthInputs();

        this.GENERATEBUTTON.onclick = async () =>
        {
            await this.GenerateCalendar();
            const saveData = this.CreateSaveFile();
            await OBR.room.setMetadata({ [`${Constants.EXTENSIONID}/saveData`]: saveData });
            this.MAINBUTTON.click();
        }

        this.IMPORTCONFIRMBUTTON.onclick = async () => await this.ImportCalendarData();
    }

    public SetupTabControls()
    {
        // Setup Tab Controls
        this.MAINBUTTON.onclick = async (e) =>
        {
            e.preventDefault();

            this.MAINPANEL.style.display = "block";
            this.MAINBUTTON.classList.add("selected");

            this.CONFIGPANEL.style.display = "none";
            this.CONFIGBUTTON.classList.remove("selected");
            this.IMPORTPANEL.style.display = "none";
            this.IMPORTBUTTON.classList.remove("selected");
        };

        this.CONFIGBUTTON.onclick = async (e) =>
        {
            e.preventDefault();

            this.CONFIGPANEL.style.display = "block";
            this.CONFIGBUTTON.classList.add("selected");

            this.MAINPANEL.style.display = "none";
            this.MAINBUTTON.classList.remove("selected");
            this.IMPORTPANEL.style.display = "none";
            this.IMPORTBUTTON.classList.remove("selected");
        };

        this.IMPORTBUTTON.onclick = async (e) =>
        {
            e.preventDefault();

            this.IMPORTPANEL.style.display = "block";
            this.IMPORTBUTTON.classList.add("selected");

            this.MAINPANEL.style.display = "none";
            this.MAINBUTTON.classList.remove("selected");
            this.CONFIGPANEL.style.display = "none";
            this.CONFIGBUTTON.classList.remove("selected");
        };
    }

    private SetupMoonMagic()
    {
        const spellContainer = document.getElementById('calendarSpellContainer') as HTMLDivElement;
        const spellLabel = document.createElement('div');
        let spellDCValue: number = 0;
        spellLabel.textContent = "SpLvl: ";
        spellLabel.classList.add('lunar-magic-label');
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

        const profContainer = document.getElementById('calendarProfContainer') as HTMLDivElement;
        const profLabel = document.createElement('div');
        profLabel.textContent = " :Prof";
        profLabel.classList.add('lunar-magic-label');
        profLabel.style.marginTop = "4px";
        const profInput = document.createElement('input');
        profInput.id = "profInput";
        profInput.type = 'number';
        profInput.classList.add('moon-mage-stuff');
        profContainer?.appendChild(profInput);
        profContainer?.appendChild(profLabel);
    }

    private AddMonthInputs()
    {
        //Clear existing month input fields
        this.CONFIGMONTHSINPUTCONTAINER.innerHTML = '';

        for (let i = 1; i <= (+this.CONFIGMONTHSNUMINPUT.value); i++)
        {
            const monthDiv = document.createElement('div');
            monthDiv.classList.add('month-input-container');
            monthDiv.innerHTML = `
            <label for="month${i}Name">Name ${i}:</label>
            <input type="text" id="month${i}Name" name="month${i}Name" value="Month${i}">
    
            <label for="month${i}Days">Days:</label>
            <input type="number" class="input-mini" id="month${i}Days" name="month${i}Days" min="1" value="30">
          `;
            this.CONFIGMONTHSINPUTCONTAINER.appendChild(monthDiv);
        }
    }

    private AddDayInputs()
    {
        // Clear existing day name input fields
        this.CONFIGDAYSINWEEKCONTAINER.innerHTML = '';

        for (let i = 1; i <= (+this.CONFIGDAYSPERWEEKINPUT.value); i++)
        {
            const dayNameDiv = document.createElement('div');
            dayNameDiv.classList.add('day-input-container');
            dayNameDiv.innerHTML = `
            <label for="day${i}Name">Day ${i} Name:</label>
            <input type="text" id="day${i}Name" name="day${i}Name" value="Day${i}">
          `;
            this.CONFIGDAYSINWEEKCONTAINER.appendChild(dayNameDiv);
        }
    }

    private AddMoonInput()
    {
        // Clear existing moon input fields
        this.CONFIGMOONSINPUTCONTAINER.innerHTML = '';

        for (let i = 1; i <= (+this.CONFIGMOONSNUMINPUT.value); i++)
        {
            const moonDiv = document.createElement('div');
            moonDiv.innerHTML = `
            <label for="moon${i}Name">Name:</label>
            <input type="text" class="moon-input" id="moon${i}Name" name="moon${i}Name" value="Moon${i}">
    
            <label for="moon${i}Cycle">Cycle (days):</label>
            <input type="number" class="input-mini" id="moon${i}Cycle" name="moon${i}Cycle" min="1" value="30">
            </br>
            <label for="moon${i}Shift">○ Shift:</label>
            <input type="number" class="input-mini" id="moon${i}Shift" name="moon${i}Shift" min="0" value="0">
            
            <label for="moon${i}Color">Color(Hex):</label>
            <input type="text" class="moon-input" id="moon${i}Color" name="moon${i}Color" value="#000000">
          `;
            this.CONFIGMOONSINPUTCONTAINER.appendChild(moonDiv);
        }
    }

    private GetSpecialValue(category: "month" | "day" | "moon", index: number, type: "Name" | "Days" | "Cycle" | "Shift" | "Color")
    {
        return (document.getElementById(`${category}${index}${type}`) as HTMLInputElement).value;
    }

    public async GenerateCalendar()
    {
        // Get month names and days
        const monthNames = [];
        const monthDays = [];
        for (let i = 1; i <= (+this.CONFIGMONTHSNUMINPUT.value); i++)
        {
            const monthName = this.GetSpecialValue("month", i, "Name");
            const monthDay = this.GetSpecialValue("month", i, "Days");
            monthNames.push(monthName);
            monthDays.push(monthDay);
        }

        // Get day names
        const dayNames = [];
        for (let i = 1; i <= (+this.CONFIGDAYSPERWEEKINPUT.value); i++)
        {
            const dayName = this.GetSpecialValue("day", i, "Name");
            dayNames.push(dayName);
        }

        // Create the calendar container
        const calendarContainer = document.createElement('div');
        calendarContainer.classList.add('calendar-system-container');

        const toggleNode = document.createElement('button');
        toggleNode.classList.add("title-line");
        toggleNode.title = "Click to toggle on/off the Day Tag on the Action button."
        toggleNode.value = BSCACHE.disableBadgeText ? "OFF" : "ON";
        toggleNode.textContent = this.CONFIGNAMEINPUT.value;
        toggleNode.onclick = async (e) =>
        {
            e.preventDefault();

            if (toggleNode.value === "ON")
            {
                await OBR.action.setBadgeText(undefined);
                await OBR.room.setMetadata({ [`${Constants.EXTENSIONID}/bdOff${BSCACHE.playerId}`]: true });
                toggleNode.value = "OFF";
            }
            else
            {
                await OBR.action.setBadgeText(BSCACHE.savedDateActionText);
                await OBR.room.setMetadata({ [`${Constants.EXTENSIONID}/bdOff${BSCACHE.playerId}`]: false });
                toggleNode.value = "ON";
            }
        };

        // Add calendar name as the caption
        this.TITLECONTAINER.innerHTML = "";
        this.TITLECONTAINER.appendChild(toggleNode);

        // Create a table for each month
        const startingDayForYearNumber = parseInt(this.CONFIGDAYSYEARSTARTINPUT.value);
        const startingDaysInWeekNumber = parseInt(this.CONFIGDAYSPERWEEKINPUT.value);
        let lastWeekday = startingDayForYearNumber > startingDaysInWeekNumber ? startingDayForYearNumber % startingDaysInWeekNumber : startingDayForYearNumber; // Initialize with the first weekday
        let newMonth = true; // New month to space the beginning days
        for (let monthIndex = 0; monthIndex < (+this.CONFIGMONTHSNUMINPUT.value); monthIndex++)
        {
            const monthBackButton = document.createElement('button');
            monthBackButton.title = "View previous Month";
            monthBackButton.classList.add("mon-back-button");
            monthBackButton.classList.add("clickable");
            monthBackButton.style.background = "url(./month-back.svg) no-repeat center center";
            monthBackButton.style.backgroundSize = 'contain';
            monthBackButton.onclick = () =>
            {
                let newValue = (this.viewingMonth - 1);
                if (newValue < 1)
                {
                    newValue = (+this.CONFIGMONTHSNUMINPUT.value);
                }
                this.viewingMonth = newValue;
                this.ChangeVisibleMonth();
            };
            const monthForwardButton = document.createElement('button');
            monthForwardButton.title = "View next Month";
            monthForwardButton.classList.add("mon-forward-button");
            monthForwardButton.classList.add("clickable");
            monthForwardButton.style.background = "url(./month-forward.svg) no-repeat center center";
            monthForwardButton.style.backgroundSize = 'contain';
            monthForwardButton.onclick = async () =>
            {
                let newValue = (this.viewingMonth + 1);
                if (newValue > (+this.CONFIGMONTHSNUMINPUT.value))
                {
                    newValue = 1;
                }
                this.viewingMonth = newValue;
                this.ChangeVisibleMonth();
            };

            const monthTable = document.createElement('table');
            monthTable.classList.add('calendar-system');
            monthTable.id = `monthTable${monthIndex}`;
            const monthTableHead = monthTable.createTHead();
            const monthTableBody = monthTable.createTBody();
            monthTableBody.classList.add('month-table-body');

            // Add month header
            const monthName = monthNames[monthIndex] ? monthNames[monthIndex] : `Month ${(monthIndex + 1).toString()}`;

            // Current MONTH Check//
            ///////////////////////
            const monthHeaderRow = monthTableHead.insertRow();
            monthHeaderRow.classList.add("month-row");
            const monthHeaderCell = monthHeaderRow.insertCell();
            monthHeaderCell.classList.add("month-header-cell");
            monthHeaderCell.title = monthName;

            const flexDiv = document.createElement('div');
            flexDiv.classList.add("month-flex-name-container");
            const nameDiv = document.createElement('div');
            nameDiv.innerText = monthName;
            nameDiv.classList.add('name-div-control-bar');
            nameDiv.id = `nameDiv${monthIndex}`;
            monthHeaderCell.appendChild(flexDiv);

            // Create Day Toggles
            const dayBackButton = document.createElement('button');
            dayBackButton.title = "Select Previous Day";
            dayBackButton.classList.add("day-back-button");
            dayBackButton.classList.add("clickable");
            dayBackButton.style.background = "url(./day-back.svg) no-repeat center center";
            dayBackButton.style.backgroundSize = 'contain';
            dayBackButton.style.display = 'none';
            dayBackButton.id = `dayBackButton${monthIndex}`;
            dayBackButton.onclick = async () =>
            {
                this.CONFIGDAYCURRENTINPUT.value = (+this.CONFIGDAYCURRENTINPUT.value - 1).toString();
                await this.SetCurrentDate();
            };
            const dayForwardButton = document.createElement('button');
            dayForwardButton.title = "Select Next Day";
            dayForwardButton.classList.add("day-forward-button");
            dayForwardButton.classList.add("clickable");
            dayForwardButton.style.background = "url(./day-forward.svg) no-repeat center center";
            dayForwardButton.style.backgroundSize = 'contain';
            dayForwardButton.style.display = 'none';
            dayForwardButton.id = `dayForwardButton${monthIndex}`;
            dayForwardButton.onclick = async () =>
            {
                this.CONFIGDAYCURRENTINPUT.value = (+this.CONFIGDAYCURRENTINPUT.value + 1).toString();
                await this.SetCurrentDate();
            };

            nameDiv.classList.add("month-name-flex");
            if (BSCACHE.playerRole === "GM" && monthIndex === parseInt(this.CONFIGMONTHINPUT.value) - 1)
            {
                dayBackButton.style.display = "block";
                dayForwardButton.style.display = "block";
                nameDiv.classList.add("current-month-name-flex");
            }

            flexDiv.appendChild(monthBackButton);
            flexDiv.appendChild(dayBackButton);
            flexDiv.appendChild(nameDiv);
            flexDiv.appendChild(dayForwardButton);
            flexDiv.appendChild(monthForwardButton);

            /////////////////

            monthHeaderCell.colSpan = (+this.CONFIGDAYSPERWEEKINPUT.value); // No +1 here, since we have a separate header row

            // Add day headers
            const dayHeaderRow = monthTableHead.insertRow();
            for (const dayName of dayNames)
            {
                const dayHeaderCell = dayHeaderRow.insertCell();
                dayHeaderCell.textContent = dayName;
                dayHeaderCell.title = dayName;
                dayHeaderCell.classList.add("day-header");
            }

            // Add day cells with moon phases
            let currentWeekday = lastWeekday;
            for (let day = 1; day <= (+monthDays[monthIndex]); day++)
            {
                if (newMonth)
                {
                    // Start a new row for the first day of the week
                    monthTableBody.insertRow();
                    const firstDaysRow = monthTableBody.rows[monthTableBody.rows.length - 1];

                    for (let index = 1; index < currentWeekday; index++)
                    {
                        firstDaysRow.insertCell();
                    }
                    newMonth = false; // Set newmonth false so it doesnt add the starting row.
                }
                else
                {
                    if (currentWeekday === 1)
                    {
                        // Start a new row for the first day of the week
                        monthTableBody.insertRow();
                    }
                }
                const dayRow = monthTableBody.rows[monthTableBody.rows.length - 1];
                const dayCell = dayRow.insertCell();
                dayCell.textContent = `${day}`;
                dayCell.setAttribute('data-month', (monthIndex + 1).toString());
                dayCell.setAttribute('data-day', day.toString());
                dayCell.classList.add("day-cell");

                // Increment the currentWeekday counter
                currentWeekday++;

                // If we reached the last weekday, reset the counter for a new week
                if (currentWeekday > (+this.CONFIGDAYSPERWEEKINPUT.value))
                {
                    currentWeekday = 1;
                }
            }
            // Update the lastWeekday for the next month
            lastWeekday = currentWeekday;
            newMonth = true;
            // Add the month table to the calendar container
            calendarContainer.appendChild(monthTable);
        }

        // Display the generated calendar container
        this.CALENDARCONTAINER.innerHTML = '';
        this.CALENDARCONTAINER.appendChild(calendarContainer);
        this.viewingMonth = (+this.CONFIGMONTHINPUT.value);
        await this.SetCurrentDate();
    }

    public CreateSaveFile()
    {
        // Get days data
        const days = [];
        for (let i = 1; i <= (+this.CONFIGDAYSPERWEEKINPUT.value); i++)
        {
            const dayName = this.GetSpecialValue("day", i, "Name");
            days.push(dayName);
        }

        // Get month data
        const months: Month[] = [];
        for (let i = 1; i <= (+this.CONFIGMONTHSNUMINPUT.value); i++)
        {
            const monthName = this.GetSpecialValue("month", i, "Name");
            const monthDay = this.GetSpecialValue("month", i, "Days");
            months.push({ Name: monthName, Days: monthDay });
        }

        // Get moon data
        const moons: Moon[] = [];
        for (let i = 1; i <= (+this.CONFIGMOONSNUMINPUT.value); i++)
        {
            const moonName = this.GetSpecialValue("moon", i, "Name");
            const moonCycle = this.GetSpecialValue("moon", i, "Cycle");
            const moonShift = this.GetSpecialValue("moon", i, "Shift");
            const moonColor = this.GetSpecialValue("moon", i, "Color");
            moons.push({
                Name: moonName,
                Cycle: moonCycle,
                Shift: moonShift,
                Color: moonColor
            });
        }

        // Package up for Saving
        const saveData: SaveFile = {
            NameYear: this.CONFIGNAMEINPUT.value,
            CurrentDay: this.CONFIGDAYCURRENTINPUT.value,
            StartDayYear: (parseInt(this.CONFIGDAYSYEARSTARTINPUT.value) - 1).toString(),
            CurrentMonth: this.CONFIGMONTHINPUT.value,
            NumberMonth: this.CONFIGMONTHSNUMINPUT.value,
            DaysPerWeek: this.CONFIGDAYSPERWEEKINPUT.value,
            NumberMoons: this.CONFIGMOONSNUMINPUT.value,
            MoonSet: moons,
            MonthSet: months,
            DaySet: days
        };
        return saveData;
    }

    public ChangeVisibleMonth(showTrueDate = false)
    {
        // Find all elements with the class 'calendar-system'
        const calendarElements = document.querySelectorAll<HTMLTableElement>('.calendar-system');

        let monthValue = this.viewingMonth !== (+this.CONFIGMONTHINPUT.value) ? this.viewingMonth : (+this.CONFIGMONTHINPUT.value);

        if (showTrueDate)
        {
            monthValue = (+this.CONFIGMONTHINPUT.value);
            this.viewingMonth = monthValue;
        }
        let forward = this.shownMonth < monthValue;

        // Loop through each element
        for (const calendarElement of calendarElements)
        {
            // Check if the element has the id 'testers1'
            if (calendarElement.id === `monthTable${monthValue - 1}`)
            {
                // Display the element with id 'testers1' with a slide-in effect from the right
                setTimeout(() =>
                {
                    this.shownMonth = monthValue;
                    calendarElement.style.display = 'table';
                    calendarElement.style.transform = forward ? 'translateX(100%)' : 'translateX(-100%)';
                    calendarElement.offsetHeight; // Trigger reflow to ensure transition is applied
                    calendarElement.style.transform = 'translateX(0%)';
                    calendarElement.style.transition = 'transform 0.2s ease-in-out';
                }, 200); // Adjust the delay to match your transition duration (in milliseconds)
            } else
            {
                // Hide other elements with class 'calendar-system' with a slide-out effect to the left
                calendarElement.style.transform = forward ? 'translateX(-100%)' : 'translateX(100%)';
                calendarElement.style.transition = 'transform 0.2s ease-in-out';
                // Use a setTimeout to set display to 'none' after the transition completes
                setTimeout(() =>
                {
                    calendarElement.style.display = 'none';
                }, 200); // Adjust the delay to match your transition duration (in milliseconds)
            }
        }
    }

    public async SetCurrentDate()
    {
        const daysInMonthMax = this.GetSpecialValue("month", +this.CONFIGMONTHINPUT.value, "Days");

        if ((+this.CONFIGDAYCURRENTINPUT.value) > (+daysInMonthMax))
        {
            let newMonthInput = (+this.CONFIGMONTHINPUT.value + 1);
            if (newMonthInput > (+this.CONFIGMONTHSNUMINPUT.value))
            {
                this.CONFIGDAYCURRENTINPUT.value = "1";
                this.CONFIGMONTHINPUT.value = "1";
            }
            else
            {
                this.CONFIGMONTHINPUT.value = newMonthInput.toString();
                this.CONFIGDAYCURRENTINPUT.value = "1";
            }
        }
        else if ((+this.CONFIGDAYCURRENTINPUT.value) < 1)
        {
            let newMonthInput = (+this.CONFIGMONTHINPUT.value - 1);
            if (newMonthInput < 1)
            {
                const previousDaysInMonthMax = this.GetSpecialValue("month", +this.CONFIGMONTHSNUMINPUT.value - 1, "Days");
                this.CONFIGDAYCURRENTINPUT.value = previousDaysInMonthMax;
                this.CONFIGMONTHINPUT.value = this.CONFIGMONTHSNUMINPUT.value;
            }
            else
            {
                const previousDaysInMonthMax = this.GetSpecialValue("month", newMonthInput, "Days");
                this.CONFIGMONTHINPUT.value = (+this.CONFIGMONTHINPUT.value - 1).toString();
                this.CONFIGDAYCURRENTINPUT.value = previousDaysInMonthMax;
            }
        }

        // Remove the current date style from all cells
        const allCells = document.querySelectorAll('.calendar-system td');
        allCells.forEach(cell => cell.classList.remove('current-date'));

        // Add the current date style to the specified cell
        const currentDateCell = document.querySelector(`.calendar-system td[data-month="${this.CONFIGMONTHINPUT.value}"][data-day="${this.CONFIGDAYCURRENTINPUT.value}"]`);
        if (currentDateCell)
        {
            currentDateCell.classList.add('current-date');
        }
        this.ChangeVisibleMonth(true);

        // Get moon data
        const moons = [];
        for (let i = 1; i <= (+this.CONFIGMOONSNUMINPUT.value); i++)
        {
            const moonName = this.GetSpecialValue("moon", i, "Name");
            const moonCycle = this.GetSpecialValue("moon", i, "Cycle");
            const moonShift = this.GetSpecialValue("moon", i, "Shift");
            const moonColor = this.GetSpecialValue("moon", i, "Color");
            moons.push({
                name: moonName,
                cycle: moonCycle,
                shift: moonShift,
                color: moonColor
            });
        }

        // Add moon phases for that day
        this.MOONCONTAINER.innerHTML = "";
        for (const moon of moons)
        {
            const moonPhase = this.GetMoonPhase(+this.CONFIGDAYCURRENTINPUT.value, (+moon.cycle), (+moon.shift), moon.name, moon.color);
            this.MOONCONTAINER.appendChild(moonPhase);
        }

        if (BSCACHE.playerRole === "GM")
        {
            this.UpdateDayControls();
            this.debouncedSaveData();
        }
    }

    private async SaveData()
    {
        const saveData = CALENDAR.CreateSaveFile();
        await OBR.room.setMetadata({ [`${Constants.EXTENSIONID}/saveData`]: saveData });
        const monthName = saveData?.MonthSet[+saveData.CurrentMonth - 1]?.Name;
        BSCACHE.savedDateActionText = `${monthName ?? saveData?.CurrentMonth}:${saveData?.CurrentDay}`;
        if (!BSCACHE.disableBadgeText) await OBR.action.setBadgeText(BSCACHE.savedDateActionText);
    }

    private UpdateDayControls()
    {
        const nameDivFlexContainers = document.querySelectorAll<HTMLDivElement>('.name-div-control-bar');
        for (const nameDiv of nameDivFlexContainers)
        {
            if (nameDiv.classList.contains('current-month-name-flex'))
            {
                nameDiv.classList.remove('current-month-name-flex');
                nameDiv.classList.add('month-name-flex');
            }
            if (nameDiv.id === `nameDiv${parseInt(this.CONFIGMONTHINPUT.value) - 1}`)
            {
                nameDiv.classList.add('current-month-name-flex');
                nameDiv.classList.remove('month-name-flex');
            }
        }

        const dayForwardButtons = document.querySelectorAll<HTMLButtonElement>('.day-forward-button');
        for (const button of dayForwardButtons)
        {
            if (button.id === `dayForwardButton${parseInt(this.CONFIGMONTHINPUT.value) - 1}`)
            {
                button.style.display = 'block';
            }
            else
            {
                button.style.display = 'none';
            }
        }

        const dayBackdButtons = document.querySelectorAll<HTMLButtonElement>('.day-back-button');
        for (const button of dayBackdButtons)
        {
            if (button.id === `dayBackButton${parseInt(this.CONFIGMONTHINPUT.value) - 1}`)
            {
                button.style.display = 'block';
            }
            else
            {
                button.style.display = 'none';
            }
        }
    }

    public GetMoonPhase(dayNumber: number, cycle: number, shift: number, name: string, color: string)
    {
        // Get month data
        let daysPast = dayNumber;
        const monthNumber = parseInt(this.CONFIGMONTHINPUT.value);
        for (let i = 1; i < monthNumber; i++)
        {
            const daysInThisMonth = this.GetSpecialValue("month", i, "Days");
            daysPast += parseInt(daysInThisMonth);
        }

        const totalDays = daysPast + shift - 1; // Adjusted for 1-based indexing
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

        let moonColor = color ? color : Utilities.stringToColor(name);
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
        entireContainer.classList.add('moon-container');

        const tintContainer = document.createElement('section');
        tintContainer.classList.add('moon-icon');
        tintContainer.style.setProperty('--moon-color', moonColor);
        tintContainer.title = name;

        const labelName = document.createElement('label');
        labelName.textContent = name;
        labelName.classList.add("moon-name-label");

        const labelDC = document.createElement('label');
        labelDC.textContent = `Spell DC: ${(+phaseCheck) + this.spellDCValue}`;
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
            entireContainer.appendChild(labelDC);
            this.SPELLDCINPUT.style.display = "flex";
            this.SPELLPROFINPUT.style.display = "flex";
        }
        return entireContainer;
    }

    public async ImportCalendarData(saveFile?: SaveFile)
    {
        let donjonData;
        try
        {
            if (saveFile)
            {
                donjonData = this.TranslateSaveFileToDonJonData(saveFile);
                this.CONFIGMONTHINPUT.value = saveFile.CurrentMonth;
                this.CONFIGDAYCURRENTINPUT.value = saveFile.CurrentDay;
            }
            else
            {
                donjonData = JSON.parse(this.IMPORTTEXTINPUT.value);
            }

            // Set the calendar name
            this.CONFIGNAMEINPUT.value = donjonData.year ? donjonData.year : "Default Calendar Name";

            // Set the number of months and update the month inputs
            this.CONFIGMONTHSNUMINPUT.value = donjonData.n_months ? donjonData.n_months : "12";
            this.AddMonthInputs();

            // Set the month names and days
            for (let i = 1; i <= donjonData.n_months; i++)
            {
                (document.getElementById(`month${i}Name`) as HTMLInputElement).value = donjonData.months[i - 1] ? donjonData.months[i - 1] : `DefaultMonth#${i}`;
                (document.getElementById(`month${i}Days`) as HTMLInputElement).value = donjonData.month_len[donjonData.months[i - 1]] ? donjonData.month_len[donjonData.months[i - 1]] : "28";
            }

            // Set the number of days per week and update the day inputs
            this.CONFIGDAYSPERWEEKINPUT.value = donjonData.weekdays.length > 0 ? donjonData.weekdays.length : "7";
            this.AddDayInputs();

            // Set the day names
            for (let i = 1; i <= donjonData.weekdays.length; i++)
            {
                (document.getElementById(`day${i}Name`) as HTMLInputElement).value = donjonData.weekdays[i - 1] ? donjonData.weekdays[i - 1] : `DefaultDay#${i}`;
            }

            // Set the number of moons and add moon inputs
            this.CONFIGMOONSNUMINPUT.value = donjonData.n_moons ? donjonData.n_moons : "2";
            this.AddMoonInput();

            // Set the moon names, cycles, and shifts
            for (let i = 1; i <= donjonData.n_moons; i++)
            {
                (document.getElementById(`moon${i}Name`) as HTMLInputElement).value = donjonData.moons[i - 1] ? donjonData.moons[i - 1] : `DefaultMoon#${i}`;
                (document.getElementById(`moon${i}Cycle`) as HTMLInputElement).value = donjonData.lunar_cyc[donjonData.moons[i - 1]] ? donjonData.lunar_cyc[donjonData.moons[i - 1]] : `28`;
                (document.getElementById(`moon${i}Shift`) as HTMLInputElement).value = donjonData.lunar_shf[donjonData.moons[i - 1]] ? donjonData.lunar_shf[donjonData.moons[i - 1]] : `0`;

                const colorCheck = donjonData.lunar_col;
                if (colorCheck)
                {
                    (document.getElementById(`moon${i}Color`) as HTMLInputElement).value = donjonData.lunar_col[donjonData.moons[i - 1]] ? donjonData.lunar_col[donjonData.moons[i - 1]] : `#000000`;
                }
            }

            // Set the total days in the year
            this.CONFIGDAYSINYEARINPUT.value = donjonData.year_len ? donjonData.year_len : "336";

            // Set the starting day of the year (DonJonData Starts at 0)
            this.CONFIGDAYSYEARSTARTINPUT.value = donjonData.first_day ? (parseInt(donjonData.first_day) + 1).toString() : "1";

            await this.GenerateCalendar();
            const monthName = saveFile?.MonthSet[+saveFile.CurrentMonth - 1]?.Name;

            BSCACHE.savedDateActionText = `${monthName ?? saveFile?.CurrentMonth}:${saveFile?.CurrentDay}`;
            if (!BSCACHE.disableBadgeText) await OBR.action.setBadgeText(BSCACHE.savedDateActionText);

            if (!saveFile)
            {
                this.MAINBUTTON.click();
                await OBR.notification.show("Calendar Imported Successfully!", "SUCCESS");
            }
        } catch (error)
        {
            alert('Invalid Calendar Format.');
            console.error(error);
        }
    }

    public TranslateSaveFileToDonJonData(saveFile: SaveFile): any
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
        donjonData.lunar_col = {};
        saveFile.MoonSet.forEach((moon, index) =>
        {
            donjonData.moons[index] = moon.Name || `DefaultMoon#${index + 1}`;
            donjonData.lunar_cyc[donjonData.moons[index]] = moon.Cycle || "28";
            donjonData.lunar_shf[donjonData.moons[index]] = moon.Shift || "0";
            donjonData.lunar_col[donjonData.moons[index]] = moon.Color || "#000000";
        });

        // Set the total days in the year
        donjonData.year_len = saveFile.DaysPerWeek || "336";
        donjonData.first_day = saveFile.StartDayYear || "0";

        return donjonData;
    }
}

export const CALENDAR = new CalendarMain();