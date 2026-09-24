/**
 * Tests for the New Zealand working-day calendar.
 *
 * A statutory deadline computed wrong is worse than no deadline at all, so this
 * runs on every check. Run with: npm run check:days
 */
import {
  addWorkingDays,
  clockPosition,
  isCalendarCovered,
  isInChristmasShutdown,
  isWorkingDay,
  workingDaysBetween,
} from "../lib/working-days";

let failures = 0;

function check(label: string, condition: boolean, detail = "") {
  if (condition) {
    console.log(`  PASS  ${label}`);
  } else {
    failures++;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

function eq(label: string, actual: unknown, expected: unknown) {
  check(label, actual === expected, `got ${String(actual)}, expected ${String(expected)}`);
}

console.log("\nWeekends");
eq("Fri 18 Sep 2026 is a working day", isWorkingDay("2026-09-18"), true);
eq("Sat 19 Sep 2026 is not", isWorkingDay("2026-09-19"), false);
eq("Sun 20 Sep 2026 is not", isWorkingDay("2026-09-20"), false);
eq("Mon 21 Sep 2026 is a working day", isWorkingDay("2026-09-21"), true);

console.log("\nPublic holidays");
eq("Labour Day, Mon 26 Oct 2026", isWorkingDay("2026-10-26"), false);
eq("the Friday before Labour Day is normal", isWorkingDay("2026-10-23"), true);
eq("ANZAC Day observed, Mon 27 Apr 2026", isWorkingDay("2026-04-27"), false);
eq("Waitangi Day, Fri 6 Feb 2026", isWorkingDay("2026-02-06"), false);
eq("Good Friday, 3 Apr 2026", isWorkingDay("2026-04-03"), false);

console.log("\nRegional anniversary days differ by region");
eq("Auckland Anniversary, Mon 26 Jan 2026", isWorkingDay("2026-01-26", "Auckland"), false);
eq("but 26 Jan is a working day in Wellington", isWorkingDay("2026-01-26", "Wellington"), true);
eq("Wellington Anniversary, Mon 19 Jan 2026", isWorkingDay("2026-01-19", "Wellington"), false);
eq("but 19 Jan is a working day in Auckland", isWorkingDay("2026-01-19", "Auckland"), true);

console.log("\nThe Christmas shutdown — 24 Dec to 5 Jan inclusive");
eq("24 Dec is excluded", isInChristmasShutdown("2026-12-24"), true);
eq("5 Jan is excluded", isInChristmasShutdown("2027-01-05"), true);
eq("6 Jan is not", isInChristmasShutdown("2027-01-06"), false);
eq("23 Dec is not", isInChristmasShutdown("2026-12-23"), false);
eq("Thu 31 Dec 2026 is not a working day", isWorkingDay("2026-12-31"), false);
eq("Tue 5 Jan 2027 is not a working day", isWorkingDay("2027-01-05"), false);
eq("Wed 6 Jan 2027 is a working day", isWorkingDay("2027-01-06"), true);

console.log("\nCounting forward");
eq("1 working day after Fri 18 Sep is Mon 21 Sep", addWorkingDays("2026-09-18", 1), "2026-09-21");
eq("5 working days after Fri 18 Sep is Fri 25 Sep", addWorkingDays("2026-09-18", 5), "2026-09-25");
eq(
  "20 working days after a claim served 10 Sep 2026",
  addWorkingDays("2026-09-10", 20),
  "2026-10-08"
);
check(
  "a span over Labour Day gains a day",
  addWorkingDays("2026-10-19", 10) === "2026-11-03",
  addWorkingDays("2026-10-19", 10)
);

console.log("\nThe shutdown pushes deadlines into February");
const dec = addWorkingDays("2026-12-15", 20);
check(
  "a claim served 15 Dec 2026 is not due until well into 2027",
  dec.startsWith("2027-"),
  dec
);
check(
  "and the naive answer (20 calendar weekdays, ~12 Jan) would be far too early",
  dec > "2027-01-20",
  dec
);

console.log("\nCounting backward");
eq("no working days between a date and itself", workingDaysBetween("2026-09-18", "2026-09-18"), 0);
eq("Fri to Mon is one working day", workingDaysBetween("2026-09-18", "2026-09-21"), 1);
eq("a full week is five", workingDaysBetween("2026-09-18", "2026-09-25"), 5);
eq("the count never goes negative", workingDaysBetween("2026-09-25", "2026-09-18"), 0);

console.log("\nRound trip");
for (const n of [1, 5, 10, 20]) {
  const due = addWorkingDays("2026-09-10", n);
  eq(`${n} working days forward then back gives ${n}`, workingDaysBetween("2026-09-10", due), n);
}

console.log("\nClock position");
const open = clockPosition("2026-09-10", 20, "2026-09-18");
eq("a claim served 10 Sep is due 8 Oct", open.dueOn, "2026-10-08");
eq("six working days elapsed by 18 Sep", open.elapsed, 6);
eq("fourteen remain", open.remaining, 14);
eq("not overdue", open.overdue, false);

const late = clockPosition("2026-08-03", 20, "2026-09-18");
eq("a claim served 3 Aug is overdue by 18 Sep", late.overdue, true);
check("and the shortfall is reported as a negative", late.remaining < 0, String(late.remaining));

console.log("\nHonesty about calendar coverage");
eq("2026 is covered", isCalendarCovered("2026-05-01"), true);
eq("2030 is not", isCalendarCovered("2030-05-01"), false);
eq("an uncovered span is flagged", clockPosition("2030-05-01", 20, "2030-05-10").uncertain, true);
eq("a covered span is not", clockPosition("2026-09-10", 20, "2026-09-18").uncertain, false);

console.log(
  `\n${failures === 0 ? "All working-day checks passed." : `${failures} check(s) FAILED.`}\n`
);
process.exit(failures === 0 ? 0 : 1);
