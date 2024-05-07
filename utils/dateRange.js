Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  }

module.exports.dateRanges = (startDate,endDate) => {
    const dates = []
	let currentDate = startDate
	const addDays = function (days) {
	  const date = new Date(this.valueOf())
	  date.setDate(date.getDate() + days)
	  return date
	}
	while (currentDate <= endDate) {
	  dates.push(currentDate)
	  currentDate = addDays.call(currentDate, 1)
	}
	return dates
  }