interface SaveFile
{
    NameYear: string;
    CurrentMonth: string;
    CurrentDay: string;
    NumberMonth: string;
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
}

interface OutsideInput
{
    Increment: number;
    Timestamp: string;
}