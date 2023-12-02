import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<h1>Fantasy Calendar</h1>

<label for="currentDay">Current Day:</label>
<input type="number" id="currentDay" name="currentDay" value="1">

<label for="currentMonth">Current Month:</label>
<input type="number" id="currentMonth" name="currentMonth" value="1">

<label for="calendarName">Calendar Name:</label>
<input type="text" id="calendarName" name="calendarName" value="Testers">

<label for="numMonths">Number of Months:</label>
<input type="number" id="numMonths" name="numMonths" min="1" value="12">
<div id="monthInputContainer"></div>

<label for="daysPerWeek">Days per Week:</label>
<input type="number" id="daysPerWeek" name="daysPerWeek" min="1" value="7">
<div id="dayNameInputContainer"></div>

<label for="numMoons">Number of Moons:</label>
<input type="number" id="numMoons" name="numMoons" min="1" value="1">
<div id="moonInputContainer"></div>

<label for="totalDaysInYear">Total Days in Year:</label>
<input type="number" id="totalDaysInYear" name="totalDaysInYear" min="1" value="365">

<button id="generateCalendar">Generate Calendar</button>

<label for="donjonJson">DonJon Calendar JSON:</label>
<textarea id="donjonJson" rows="5"></textarea>
<button id="importDonJon">Import DonJon Calendar</button>

<div id="calendarOutput"></div>
`;

// calendar Inputs
const calendarNameInput = document.getElementById('calendarName')! as HTMLInputElement;
const daysPerWeekInput = document.getElementById('daysPerWeek')! as HTMLInputElement;
const monthInputContainer = document.getElementById('monthInputContainer') as HTMLDivElement;
const numMonthsInput = document.getElementById('numMonths') as HTMLInputElement
const dayNameInputContainer = document.getElementById('dayNameInputContainer') as HTMLDivElement;
const moonInputContainer = document.getElementById('moonInputContainer') as HTMLDivElement;
const moonNumberInput = document.getElementById('numMoons') as HTMLInputElement;
const generateButton = document.getElementById('generateCalendar')!;
const donJonButton = document.getElementById('importDonJon')!;
const calendarOutputContainer = document.getElementById('calendarOutput')! as HTMLDivElement;

const currentDayInput = document.getElementById('currentDay')! as HTMLInputElement;
currentDayInput.onchange = () => setCurrentDate();
const currentMonthInput = document.getElementById('currentMonth')! as HTMLInputElement;
currentMonthInput.onchange = () => setCurrentDate();

// Setup Onclicks
generateButton.onclick = () => generateCalendar();
donJonButton.onclick = () => importDonJonCalendar();

// Setup Onchange Handlers
daysPerWeekInput.onchange = () => updateDayInputs();
moonNumberInput.onchange = () => addMoonInput();
numMonthsInput.onchange = () => updateMonthInputs();

// On Load
addMoonInput();
updateMonthInputs();
updateDayInputs();

function updateMonthInputs()
{
    // Clear existing month input fields
    monthInputContainer.innerHTML = '';

    for (let i = 1; i <= (+numMonthsInput.value); i++)
    {
        const monthDiv = document.createElement('div');
        monthDiv.innerHTML = `
        <label for="month${i}Name">Month ${i} Name:</label>
        <input type="text" id="month${i}Name" name="month${i}Name" value="Month${i}">

        <label for="month${i}Days">Month ${i} Days:</label>
        <input type="number" id="month${i}Days" name="month${i}Days" min="1" value="30">
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
        <label for="moon${i}Name">Moon ${i} Name:</label>
        <input type="text" id="moon${i}Name" name="moon${i}Name" value="Moon${i}">

        <label for="moon${i}Cycle">Moon ${i} Cycle (days):</label>
        <input type="number" id="moon${i}Cycle" name="moon${i}Cycle" min="1" value="30">

        <label for="moon${i}Shift">Moon ${i} Shift:</label>
        <input type="number" id="moon${i}Shift" name="moon${i}Shift" min="0" value="0">
      `;
        moonInputContainer.appendChild(moonDiv);
    }
}

function GetSpecialValue(category: "month" | "day" | "moon", index: number, type: "Name" | "Days" | "Cycle" | "Shift")
{
    return (document.getElementById(`${category}${index}${type}`) as HTMLInputElement).value;
}
function generateCalendar()
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

    // Create the calendar container
    const calendarContainer = document.createElement('div');
    calendarContainer.classList.add('calendar-system-container');

    // Add calendar name as the caption
    const caption = document.createElement('h2');
    caption.textContent = calendarNameInput.value;
    calendarContainer.appendChild(caption);

    // Create a table for each month
    for (let monthIndex = 0; monthIndex < (+numMonthsInput.value); monthIndex++)
    {
        const monthTable = document.createElement('table');
        monthTable.classList.add('calendar-system');

        // Add month header
        const monthHeaderRow = monthTable.insertRow();
        const monthHeaderCell = monthHeaderRow.insertCell();
        monthHeaderCell.colSpan = (+daysPerWeekInput.value); // No +1 here, since we have a separate header row
        monthHeaderCell.textContent = `Month ${monthIndex + 1}: ${monthNames[monthIndex]}`;

        // Add day headers
        const dayHeaderRow = monthTable.insertRow();
        for (const dayName of dayNames)
        {
            const dayHeaderCell = dayHeaderRow.insertCell();
            dayHeaderCell.textContent = dayName;
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

            if (day === (+currentDayInput.value) && monthIndex + 1 === (+currentMonthInput.value))
            {
                dayCell.classList.add('current-date');
            }

            // Add moon phases for that day
            for (const moon of moons)
            {
                const moonPhase = getMoonPhase(day, (+moon.cycle), (+moon.shift));
                dayCell.textContent += ` ${moonPhase}`;
            }

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
}

function setCurrentDate()
{
    const month = currentMonthInput.value;
    const day = currentDayInput.value;
    console.log(`DAY: ${day}  MONTH: ${month}`);
    // Remove the current date style from all cells
    const allCells = document.querySelectorAll('.calendar-system td');
    allCells.forEach(cell => cell.classList.remove('current-date'));

    // Add the current date style to the specified cell
    const currentDateCell = document.querySelector(`.calendar-system td[data-month="${month}"][data-day="${day}"]`);
    if (currentDateCell)
    {
        currentDateCell.classList.add('current-date');
    }
}

function getMoonPhase(dayNumber: number, cycle: number, shift: number)
{
    const totalDays = dayNumber + shift;
    const moonIndex = (totalDays % cycle);
    return moonIndex === 0 ? 'Full Moon' : `Moon${moonIndex}`;
}

// Don Jon Importer
function importDonJonCalendar()
{
    const donjonJson = (document.getElementById('donjonJson') as HTMLTextAreaElement).value;

    try
    {
        const donjonData = JSON.parse(donjonJson);

        // Set the calendar name
        calendarNameInput.value = donjonData.year;

        // Set the number of months and update the month inputs
        numMonthsInput.value = donjonData.n_months;
        updateMonthInputs();

        // Set the month names and days
        for (let i = 1; i <= donjonData.n_months; i++)
        {
            (document.getElementById(`month${i}Name`) as HTMLInputElement).value = donjonData.months[i - 1];
            (document.getElementById(`month${i}Days`) as HTMLInputElement).value = donjonData.month_len[donjonData.months[i - 1]];
        }

        // Set the number of days per week and update the day inputs
        (document.getElementById('daysPerWeek') as HTMLInputElement).value = donjonData.weekdays.length;
        updateDayInputs();

        // Set the day names
        for (let i = 1; i <= donjonData.weekdays.length; i++)
        {
            (document.getElementById(`day${i}Name`) as HTMLInputElement).value = donjonData.weekdays[i - 1];
        }

        // Set the number of moons and add moon inputs
        (document.getElementById('numMoons') as HTMLInputElement).value = donjonData.n_moons;
        addMoonInput();

        // Set the moon names, cycles, and shifts
        for (let i = 1; i <= donjonData.n_moons; i++)
        {
            (document.getElementById(`moon${i}Name`) as HTMLInputElement).value = donjonData.moons[i - 1];
            (document.getElementById(`moon${i}Cycle`) as HTMLInputElement).value = donjonData.lunar_cyc[donjonData.moons[i - 1]];
            (document.getElementById(`moon${i}Shift`) as HTMLInputElement).value = donjonData.lunar_shf[donjonData.moons[i - 1]];
        }

        // Set the total days in the year
        (document.getElementById('totalDaysInYear') as HTMLInputElement).value = donjonData.year_len;

        alert('DonJon Calendar imported successfully!');
    } catch (error)
    {
        alert('Invalid DonJon Calendar JSON.');
        console.error(error);
    }
}
