import React, { useState, useMemo } from 'react';
import './BookingCalendar.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

/**
 * BookingCalendar
 * @param {Array}    bookedRanges   – [{ startDate, endDate }, ...] of already booked periods
 * @param {Function} onRangeSelect  – called with (startISO, endISO) when user completes a selection
 * @param {string}   startDate      – controlled start value (ISO string)
 * @param {string}   endDate        – controlled end value (ISO string)
 */
function BookingCalendar({ bookedRanges = [], onRangeSelect, startDate, endDate }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [hoverDate, setHoverDate] = useState(null);

  // Normalise booked ranges to plain Date objects
  const normRanges = useMemo(() =>
    bookedRanges.map(r => ({
      start: new Date(r.startDate),
      end:   new Date(r.endDate),
    })),
  [bookedRanges]);

  const isBooked = (date) =>
    normRanges.some(r => date >= r.start && date <= r.end);

  const isPast = (date) => date < today;

  const selStart = startDate ? new Date(startDate) : null;
  const selEnd   = endDate   ? new Date(endDate)   : null;

  const isRangeStart = (date) => selStart && date.toDateString() === selStart.toDateString();
  const isRangeEnd   = (date) => selEnd   && date.toDateString() === selEnd.toDateString();
  const isInRange    = (date) => {
    const rangeEnd = selectingEnd && hoverDate ? new Date(hoverDate) : selEnd;
    if (!selStart || !rangeEnd) return false;
    const lo = selStart < rangeEnd ? selStart : rangeEnd;
    const hi = selStart < rangeEnd ? rangeEnd : selStart;
    return date > lo && date < hi;
  };

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const handleDayClick = (date) => {
    if (!date || isPast(date) || isBooked(date)) return;
    const iso = date.toISOString().split('T')[0];

    if (!selStart || (selStart && selEnd)) {
      // Starting fresh selection
      onRangeSelect(iso, '');
      setSelectingEnd(true);
    } else {
      // Completing selection
      if (date < selStart) {
        onRangeSelect(iso, startDate);
      } else {
        onRangeSelect(startDate, iso);
      }
      setSelectingEnd(false);
      setHoverDate(null);
    }
  };

  const handleDayHover = (date) => {
    if (selectingEnd && date) setHoverDate(date);
  };

  return (
    <div className="bc-wrapper">
      <div className="bc-header">
        <button className="bc-nav-btn" onClick={prevMonth} title="Previous month">‹</button>
        <h3>{MONTHS[viewMonth]} {viewYear}</h3>
        <button className="bc-nav-btn" onClick={nextMonth} title="Next month">›</button>
      </div>

      <div className="bc-grid">
        {DAYS.map(d => <div key={d} className="bc-day-name">{d}</div>)}

        {cells.map((date, idx) => {
          if (!date) return <div key={`e${idx}`} className="bc-day bc-day--empty" />;

          const booked = isBooked(date);
          const past   = isPast(date);
          const rStart = isRangeStart(date);
          const rEnd   = isRangeEnd(date);
          const inRng  = isInRange(date);
          const isToday = date.toDateString() === today.toDateString();

          const cls = [
            'bc-day',
            booked  ? 'bc-day--booked'      : '',
            past    ? 'bc-day--past'         : '',
            rStart  ? 'bc-day--range-start'  : '',
            rEnd    ? 'bc-day--range-end'    : '',
            inRng   ? 'bc-day--in-range'     : '',
            isToday ? 'bc-day--today'        : '',
          ].filter(Boolean).join(' ');

          return (
            <div
              key={date.toISOString()}
              className={cls}
              onClick={() => handleDayClick(date)}
              onMouseEnter={() => handleDayHover(date)}
              title={booked ? 'Already booked' : past ? 'Past date' : undefined}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>

      <div className="bc-legend">
        <span className="bc-legend-item">
          <span className="bc-legend-dot bc-legend-dot--booked" /> Booked
        </span>
        <span className="bc-legend-item">
          <span className="bc-legend-dot bc-legend-dot--selected" /> Selected
        </span>
        <span className="bc-legend-item">
          <span className="bc-legend-dot bc-legend-dot--range" /> Your range
        </span>
      </div>
    </div>
  );
}

export default BookingCalendar;
