interface SaveFile
{
    NameYear: string;
    CurrentMonth: string;
    CurrentDay: string;
    NumberMonth: string;
    StartDayYear: string;
    DaysPerWeek: string;
    NumberMoons: string;
    MoonSet: Moon[];
    MonthSet: Month[];
    DaySet: string[];
}

interface Month
{
    Name: string;
    Days: string;
}

interface Moon
{
    Name: string;
    Cycle: string;
    Shift: string;
    Color: string;
}

interface OutsideInput
{
    Increment: number;
    Timestamp: string;
}