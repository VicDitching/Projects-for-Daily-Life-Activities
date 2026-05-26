let currentDate = new Date();
let events = JSON.parse(localStorage.getItem("events")) || [];
let selectedDate = null;
let editingEventId = null;

// Elements
const currentDay = document.getElementById("current-day");
const currentDateText = document.getElementById("current-date");
const currentTime = document.getElementById("current-time");
const calendarGrid = document.getElementById("calendar-grid");
const monthYear = document.getElementById("month-year");

const eventModal = document.getElementById("event-modal");
const modalDate = document.getElementById("modal-date");
const listView = document.getElementById("list-view");
const editView = document.getElementById("edit-view");
const eventList = document.getElementById("event-list");

const eventTitle = document.getElementById("event-title");
const eventTime = document.getElementById("event-time");
const eventDate = document.getElementById("event-date");
const eventRepeat = document.getElementById("event-repeat");

// -------- TIME PANEL --------
function updateDateTime() {
  const now = new Date();
  currentDay.textContent = now.toLocaleDateString("en-US",{weekday:"long"});
  currentDateText.textContent = now.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
  currentTime.textContent = now.toLocaleTimeString();
}

// -------- CALENDAR --------
function generateCalendar() {
  calendarGrid.innerHTML = "";
  monthYear.textContent = currentDate.toLocaleDateString("en-US",{month:"long",year:"numeric"});

  ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(d=>{
    const h=document.createElement("div");
    h.textContent=d;
    h.className="weekday";
    calendarGrid.appendChild(h);
  });

  const y=currentDate.getFullYear(), m=currentDate.getMonth();
  const first=new Date(y,m,1).getDay();
  const days=new Date(y,m+1,0).getDate();

  for(let i=0;i<first;i++) calendarGrid.appendChild(document.createElement("div"));

  for(let d=1;d<=days;d++){
    const cell=document.createElement("div");
    cell.className="day";
    cell.textContent=d;
    const ds=`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    cell.dataset.date=ds;

    if(hasEventOnDate(ds)){
      const dot=document.createElement("div");
      dot.className="event-dot";
      cell.appendChild(dot);
    }

    cell.onclick=()=>openModal(ds);

    const today=new Date();
    if(d===today.getDate() && m===today.getMonth() && y===today.getFullYear()) cell.classList.add("today");

    calendarGrid.appendChild(cell);
  }
}

// -------- MODAL --------
function openModal(date){
  selectedDate=date;
  modalDate.textContent=date;
  eventModal.classList.remove("hidden");
  showList();
}

function closeModal(){
  eventModal.classList.add("hidden");
}

function showList(){
  listView.classList.remove("hidden");
  editView.classList.add("hidden");
  eventList.innerHTML="";

  const list=getEventsForDate(selectedDate);
  if(!list.length){
    eventList.textContent="No events";
    return;
  }

  list.forEach(e=>{
    const div=document.createElement("div");
    div.className="event-item";
    div.textContent=`${formatTime12Hour(e.time)} – ${e.title}`;
    div.onclick=()=>editEvent(e.id);
    eventList.appendChild(div);
  });
}

function showCreate(){
  editingEventId=null;
  eventTitle.value="";
  eventTime.value="12:00";
  eventDate.value=selectedDate;
  eventRepeat.value="none";
  listView.classList.add("hidden");
  editView.classList.remove("hidden");
}

function editEvent(id){
  const e=events.find(ev=>ev.id===id);
  editingEventId=id;
  eventTitle.value=e.title;
  eventTime.value=e.time;
  eventDate.value=e.date;
  eventRepeat.value=e.repeat;
  listView.classList.add("hidden");
  editView.classList.remove("hidden");
}

// -------- EVENTS --------
function saveEvent(){
  const data={
    id: editingEventId || crypto.randomUUID(),
    title: eventTitle.value,
    time: eventTime.value,
    date: eventDate.value,
    repeat: eventRepeat.value
  };

  if(editingEventId){
    events=events.map(e=>e.id===editingEventId?data:e);
  } else {
    events.push(data);
  }

  localStorage.setItem("events",JSON.stringify(events));
  generateCalendar();
  showList();
}

function deleteEvent(){
  events=events.filter(e=>e.id!==editingEventId);
  localStorage.setItem("events",JSON.stringify(events));
  generateCalendar();
  showList();
}

function getEventsForDate(date){
  const t=new Date(date);
  return events.filter(e=>{
    const s=new Date(e.date);
    if(e.repeat==="daily") return s<=t;
    if(e.repeat==="weekly") return s<=t && s.getDay()===t.getDay();
    if(e.repeat==="monthly") return s<=t && s.getDate()===t.getDate();
    if(e.repeat==="yearly") return s<=t && s.getDate()===t.getDate() && s.getMonth()===t.getMonth();
    return e.date===date;
  });
}

function hasEventOnDate(date){
  return getEventsForDate(date).length>0;
}

// -------- NAV --------
function prevMonth(){currentDate.setMonth(currentDate.getMonth()-1);generateCalendar();}
function nextMonth(){currentDate.setMonth(currentDate.getMonth()+1);generateCalendar();}

function formatTime12Hour(time24) {
  if (!time24) return "";
  const [hourStr, minute] = time24.split(":");
  let hour = parseInt(hourStr);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute} ${ampm}`;
}


// -------- INIT --------
updateDateTime();
setInterval(updateDateTime,1000);
generateCalendar();
