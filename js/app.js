(function () {
  /* eslint-disable no-undef */
/* eslint-disable one-var */
  let nav = 0,
    clicked = null,
    events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];

  const calendar = document.querySelector('.js-calendar'),
    newEventModal = document.querySelector('.js-newEventModal'),
    editEventModal = document.querySelector('.js-editEventModal'),
    modalShadow = document.querySelector('.js-modalShadow'),
    eventTitleInput = document.querySelector('.js-eventTitleInput'),
    editEventTitleInput = document.querySelector('.js-editEventTitleInput'),
    dateTimePicker = document.querySelector('.js-dateTimePicker'),
    eventTimePicker = document.querySelectorAll('.js-eventTimePicker'),
    weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  /**
  * Calling the datepicker plugin
  */
  $(() => {
    $('.dateTimePicker').datetimepicker();
  });

  /**
  * function for opening specific modals for the date we click,
  * and adding text with the event title and days left
  * @param date - the specific date we click
  */
  function openModal(date) {
    clicked = date;

    const eventForDay = events.find((e) => e.date === clicked);

    if (eventForDay) {
      if (editEventTitleInput && editEventModal) {
        const newInput = editEventModal.getElementsByTagName('input');
        newInput[0].value = eventForDay.title;
        newInput[1].value = eventForDay.dateStart;
        newInput[2].value = eventForDay.dateEnd;
        editEventTitleInput.innerText = eventForDay.title;
        editEventModal.classList.add('active');
      }
    } else if (newEventModal && modalShadow) {
      newEventModal.classList.add('active');
      modalShadow.classList.add('active');
    }
  }

  /**
  * In this function we are generating a calendar and giving it padding days
  * Creating the addEvent button
  */
  function load() {
    const dt = new Date();

    if (nav !== 0) {
      dt.setMonth(new Date().getMonth() + nav);
    }

    const day = dt.getDate();
    const month = dt.getMonth();
    const year = dt.getFullYear();

    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dateString = firstDayOfMonth.toLocaleDateString('en-us', {
      weekday: 'long',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });

    const paddingDays = weekdays.indexOf(dateString.split(', ')[0]);

    document.querySelector('.js-monthDisplay').innerText = `${dt.toLocaleDateString('en-us', { month: 'long' })} ${year}`;

    calendar.innerHTML = '';

    for (let i = 1; i <= paddingDays + daysInMonth; i += 1) {
      const daySquare = document.createElement('div'),
        addEvent = document.createElement('div');

      daySquare.classList.add('day');
      addEvent.classList.add('addEvent');
      addEvent.innerHTML = '+';
      const dayString = `${month + 1}/${i - paddingDays}/${year}`;

      if (i > paddingDays) {
        const dayIndex = document.createElement('p');
        dayIndex.classList.add('dayIndex');
        dayIndex.innerHTML = i - paddingDays;
        daySquare.appendChild(dayIndex);
        const eventForDay = events.find((e) => e.date === dayString);
        daySquare.appendChild(addEvent);

        if (i - paddingDays === day && nav === 0) {
          daySquare.classList.add('currentDay');
        }

        daySquare.addEventListener('mouseover', () => {
          if (daySquare.lastChild.classList.contains('addEvent')) {
            addEvent.classList.add('active');
          }
        });

        daySquare.addEventListener('mouseout', () => {
          addEvent.classList.remove('active');
        });
        if (eventForDay) {
          daySquare.classList.add('active');
          const eventDiv = document.createElement('div'),
            timeDiv = document.createElement('div');

          eventDiv.classList.add('event');
          timeDiv.classList.add('eventTimeLeft');

          if (eventDiv && timeDiv) {
            eventDiv.innerHTML = eventForDay.title;
            timeDiv.innerHTML = eventForDay.timeLeft;
          }

          if (daySquare) {
            daySquare.appendChild(timeDiv);
            daySquare.appendChild(eventDiv);
          }
        }

        if (addEvent) {
          addEvent.addEventListener('click', () => openModal(dayString));
        } if (daySquare.classList.contains('active')) {
          daySquare.addEventListener('click', () => openModal(dayString));
        }
      }
      if (calendar) {
        calendar.appendChild(daySquare);
      }
    }
  }

  /**
  * When we pick a specific date in the datepicker and click idi it sends us to,
  * the specific date on the calendar
  */
  function goToDate() {
    document.querySelector('.js-goToDate').addEventListener('click', () => {
      const dt = new Date(),
        targetDate = new Date(dateTimePicker.value),
        month = dt.getMonth(),
        year = dt.getFullYear(),
        targetMonth = targetDate.getMonth(),
        targetYear = targetDate.getFullYear();

      nav = (targetMonth - month) - ((year - targetYear) * 12);
      load();
    });
  }

  /**
  * On click we are closing the modal
  */
  function closeModal() {
    if (eventTitleInput && newEventModal) {
      eventTitleInput.classList.remove('error');
      newEventModal.classList.remove('active');
    }
    if (editEventModal && modalShadow) {
      editEventModal.classList.remove('active');
      modalShadow.classList.remove('active');
    }
    editEventTitleInput.value = '';
    eventTitleInput.value = '';
    clicked = null;
    load();
  }

  /**
  * Here we are creating a new event that has a title and time left for the task we have to do
  */
  function saveEvent() {
    if (eventTitleInput.value) {
      eventTitleInput.classList.remove('error');

      const dateStart = new Date(eventTimePicker[0].value),
        dateEnd = new Date(eventTimePicker[1].value),
        diffTime = Math.abs(dateStart - dateEnd),
        diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)),
        timeLeft = `Za ${diffDays} dana`;

      events.push({
        id: events.length + 1,
        date: clicked,
        title: eventTitleInput.value,
        dateStart: eventTimePicker[0].value,
        dateEnd: eventTimePicker[1].value,
        timeLeft,
      });

      localStorage.setItem('events', JSON.stringify(events));
      closeModal();
    } else {
      eventTitleInput.classList.add('error');
    }
  }

  /**
    * Here we are editing the created event
    */
  function editEvent() {
    const dateStart = new Date(eventTimePicker[2].value),
      dateEnd = new Date(eventTimePicker[3].value),
      diffTime = Math.abs(dateStart - dateEnd),
      diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)),
      timeLeft = `Za ${diffDays} dana`;

    events.push({
      id: events.length + 1,
      date: clicked,
      dateStart: eventTimePicker[2].value,
      dateEnd: eventTimePicker[3].value,
      title: editEventTitleInput.value,
      timeLeft,
    });

    events = events.filter((e) => e.date === clicked);
    if (events.length > 1) {
      events.splice(0, 1);
    }

    localStorage.setItem('events', JSON.stringify(events));
    closeModal();
    load();
  }

  /**
  * We are adding functionaliti to the arrow buttons to toggle between months
  * Initializing our buttons
  */
  function initButtons() {
    document.querySelector('.js-nextArrow').addEventListener('click', () => {
      nav += 1;
      load();
    });

    document.querySelector('.js-prevArrow').addEventListener('click', () => {
      nav -= 1;
      load();
    });

    document.querySelector('.js-saveButton').addEventListener('click', saveEvent);
    document.querySelector('.js-cancelButton').addEventListener('click', closeModal);
    document.querySelector('.js-editButton').addEventListener('click', editEvent);
    document.querySelector('.js-closeButton').addEventListener('click', closeModal);
  }

  initButtons();
  load();
  goToDate();
}());
