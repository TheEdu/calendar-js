function getMonthName(monthNumber){
	var monthName = ""
	switch(monthNumber){
		case 0:
			monthName = "Enero"
			break
		case 1:
			monthName = "Febrero"
			break
		case 2:
			monthName = "Marzo"
			break
		case 3:
			monthName = "Abril"
			break
		case 4:
			monthName = "Mayo"
			break
		case 5:
			monthName = "Junio"
			break
		case 6:
			monthName = "Julio"
			break
		case 7:
			monthName = "Agosto"
			break
		case 8:
			monthName = "Septiembre"
			break
		case 9:
			monthName = "Octubre"
			break
		case 10:
			monthName = "Noviembre"
			break
		case 11:
			monthName = "Diciembre"
			break
	}
	return monthName
}

//Add isSameDateAs Method to Date
Date.prototype.isSameDateAs = function(date) {
  return (
    this.getFullYear() === date.getFullYear() &&
    this.getMonth() === date.getMonth() &&
    this.getDate() === date.getDate()
  )
}

//Add isSameMonthAs Method to Date
Date.prototype.isSameMonthAs = function(date) {
  return (
    this.getFullYear() === date.getFullYear() &&
    this.getMonth() === date.getMonth()
  )
}

function getPreviousMonthDate(year,month){
	var prevMonth = (month == 0) ? new Date(year-1,11) : new Date(year,month-1)
	return prevMonth
}

function getNextMonthDate(year,month){
	var nextMonth = (month == 11) ? new Date(year+1,0) : new Date(year,month+1)
	return nextMonth
}

function getFirstDateOfTheMonth(year,month){
	var date = new Date(year,month,1)
	return date
}


function getLastDateOfTheMonth(year,month){
	var nextMonthDate = getNextMonthDate(year,month)
	var date = new Date(nextMonthDate.getFullYear(),nextMonthDate.getMonth(),0)
	return date
}


function getLastSundayOfTheMonth(year,month){
	var lastDate = getLastDateOfTheMonth(year,month)
	var lastSunday = lastDate.getDate() - lastDate.getDay()
	return new Date(year,month,lastSunday)
}


//The Start Point of the Calendar will be the Last Sunday of the Previous Month
function getStartPointOfTheCalendar(year,month){
	var prevMonthDate = getPreviousMonthDate(year,month)
	var lastDateOfTheMonth = getLastDateOfTheMonth(prevMonthDate.getFullYear(),prevMonthDate.getMonth()).getDate()
	var lastSundayOfTheMonth = getLastSundayOfTheMonth(prevMonthDate.getFullYear(),prevMonthDate.getMonth()).getDate()
	var startPoint = lastDateOfTheMonth - lastSundayOfTheMonth
	return -startPoint
}

//Return a List of Dates
function getCalendarDates(year,month){
	var calendarStartPoint = getStartPointOfTheCalendar(year,month)
	var calendarEndPoint = calendarStartPoint + (7*6)
	var calendarDates = []
	for (var dateNumber = calendarStartPoint; dateNumber < calendarEndPoint; dateNumber++) {
		var date = new Date(year,month,dateNumber)
	  	calendarDates.push(date)
	}
	return calendarDates
}

function prevMonth(){
	var prevDate = getPreviousMonthDate(currentYear,currentMonth)
	currentMonth = prevDate.getMonth()
	currentYear = prevDate.getFullYear()
	if(currentMonth==0 || currentMonth==11){
		holidays = getHolidays(currentYear,currentMonth)
	}
	printCalendarDates(currentYear,currentMonth)
	return false
}

function nextMonth(){
	var nextDate = getNextMonthDate(currentYear,currentMonth)
	currentMonth = nextDate.getMonth()
	currentYear = nextDate.getFullYear()
	if(currentMonth==0 || currentMonth==11){
		holidays = getHolidays(currentYear,currentMonth)
	}
	printCalendarDates(currentYear,currentMonth)
	return false
}

function getHolidays(year,month){
	var holidays = []
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var jsonHolidays = JSON.parse(this.responseText);
			for (var i = 0; i < jsonHolidays.length; i++) {
				var day = jsonHolidays[i].dia
				var month = jsonHolidays[i].mes -1
				var date = new Date(year,month,day)
				var reason = jsonHolidays[i].motivo
				var holiday = [date,reason]
				holidays.push(holiday)
			};
		}
	}
	xhttp.open("GET", "https://nolaborables.com.ar/api/v2/feriados/"+year, false)
	xhttp.send()

	//get the holidays dates of the prev/next Year if the month is jan/dec
	//recursive, month = 100000 --> exit condition
	if (month == 0){
		holidays = holidays.concat(getHolidays(year-1,100000))
	} else if(month == 11){
		holidays = holidays.concat(getHolidays(year+1,100000))
	}

	return holidays
}

function printCalendarDates(year,month){
	 document.getElementById('monthAndYear').innerHTML = getMonthName(currentMonth) + " " + currentYear
	 document.getElementById("holidays-info").innerHTML = "" // clean holidays info section
	 var calendarDates = getCalendarDates(year,month)
	 var today = new Date()
	 var monthSelectedDate = new Date(year,month)
	 for (var i = 0; i <= 5; i++) {
	 	var dates = calendarDates.slice(i*7,(i+1)*7)
	 	var row = ""
	 	var id = "dates-row-" + i
	 	document.getElementById(id).innerHTML = ""
	 	var todayClass = ""
	 	var monthClass = ""
	 	for (var p = 0; p < dates.length; p++) {
	 		todayClass = (dates[p].isSameDateAs(today)) ? "today " : ""
	 		monthClass = (dates[p].isSameMonthAs(monthSelectedDate)) ?  "" : "not-in-month "
	 		var holidayMessage = ""
	 		var holidayClass = ""
	 		for (var j = 0; j < holidays.length; j++) {
	 			if (dates[p].isSameDateAs(holidays[j][0])){
	 				holidayClass = "holiday"
	 				holidayMessage = holidays[j][1]
	 				var newHolidayInfo =document.createElement('div')
	 				newHolidayInfo.innerHTML = dates[p].getDate() + " " + getMonthName(dates[p].getMonth()).slice(0,3)  + " - " +holidayMessage
	 				document.getElementById("holidays-info").appendChild(newHolidayInfo)
	 				break;
	 			}
	 		};
	 		var newDate= document.createElement('div')
			newDate.className = (todayClass + monthClass + holidayClass)
			newDate.innerHTML = dates[p].getDate()
			newDate.setAttribute("date-info",holidayMessage)
			document.getElementById(id).appendChild(newDate)
	 	}
	  }
	  showCalendar()
	  return false
}

function showCalendar() {
  document.getElementById("loader").style.display = "none";
  document.getElementById("calendar").style.display = "block";
}

function showLoader() {
  document.getElementById("calendar").style.display = "none";
  document.getElementById("loader").style.display = "block";
}