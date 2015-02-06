/** @jsx React.DOM */
/* https://github.com/reactjs/sublime-react */
var React = require('react');

// Find out the max days for each month
var getMax = function() {
    switch (this.month) {
        case 1:
        case 3:
        case 5:
        case 7:
        case 8:
        case 10:
        case 12:
            return 31;
        case 2:
            if (this.year%4 === 0)
                return 29;
            return 28;
        default:
            return 30;
    }
}

// Get the name of the month
var getMonthName = function(month) {
    switch (month) {
        case 1:
            return "January";
        case 2:
            return "February";
        case 3:
            return "March";
        case 4:
            return "April";
        case 5:
            return "May";
        case 6:
            return "June";
        case 7:
            return "July";
        case 8:
            return "August";
        case 9:
            return "September";
        case 10:
            return "October";
        case 11:
            return "November";
        case 12:
            return "December";
    }
}

var DateBox = React.createClass({
    render: function() {
        return (
            <td 
                className={this.props.today ? 'today' : ''}>
                {this.props.day}
            </td>
        );
    }
});

// Create a calendar row
var CalendarRow = React.createClass({
    // Check  if the date is today
    isToday: function(year, month, day) {
        var d = new Date();
        return (d.getFullYear() === year && d.getMonth()+1 === month && d.getDate() === day);
    },
    render: function() {
        var i,
            days = [], // Keep track of all the DateBoxes
            day,
            blanks = this.props.blanks || 0,
            start = this.props.start || 1,
            maxDays = this.props.max;
        for (var i=0; i<7; i++) {
            if (blanks > 0) {
                blanks--;
                day = '';
            }
            else if (start > maxDays) {
                day = '';
            }
            else {
                day = start++;
            }

            days.push(<DateBox 
                        key={days.length} 
                        day={day} 
                        today={this.isToday(this.props.year, this.props.month, day)} />
            );
        }
        return (
            <tr>
                {days}
            </tr>
        );
    }
});

// Create the CalendarMonth view
var CalendarMonth = React.createClass({
    render: function() {
        var weeks = []; // Put all the CalendarRows in here
        var start = this.props.start
        var blanks = (start-1)%7;
        var max;
        
        // 
        weeks.push(
            <CalendarRow 
                key={0} 
                blanks={blanks} 
                month={this.props.month}
                year={this.props.year} />
        );
        // Go through all 5 weeks and populate the rows
        for (i=0; i<5; i++) {
            start = (8-blanks)+(7*i);
            max = getMax.call(this.props);
            // Don't render a row if it's past the max days for the month
            if (start > max) {
                break;
            }
            weeks.push(
                <CalendarRow 
                    key={i+1} 
                    start={start} 
                    month={this.props.month} 
                    year={this.props.year}
                    max={max} />
            );
            
        }
        // Create a bootstrap table with borders and the days of the week
        return (
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Sunday</th>
                        <th>Monday</th>
                        <th>Tuesday</th>
                        <th>Wednesday</th>
                        <th>Thursday</th>
                        <th>Friday</th>
                        <th>Saturday</th>
                    </tr>
                </thead>
                <tbody>{weeks}</tbody>
            </table>
        );
    }
});

// Create fields to change the month view
var SelectDate = React.createClass({
    // Use the current month and year as the starting value
    getInitialState: function() {
        var date = new Date();
        var month = date.getMonth()+1;
        var year = date.getFullYear();
        return {
            initMonth: month,
            initYear: year
        };
    },

    // Stop the form from posting when submitted
    handleSubmit: function(e) {
        e.preventDefault();
    },
    
    // Update the month and year when there is a valid selection
    handleChange: function() {
        if (this.refs.year.getDOMNode().value.length === 4) {
            this.props.onUserInput(
                this.refs.year.getDOMNode().value,
                parseInt(this.refs.month.getDOMNode().value)
            );
        }
    },
    render: function() {
        var options = [],
            i;
        // Get all the month names based on the getMonth function
        for (i=1; i<=12; i++) {
            options.push(<option key={i} value={i}>{getMonthName(i)}</option>)
        }
        return (
            <div className="fields">
                <form onSubmit={this.handleSubmit}>
                    <select
                        className="form-control" 
                        defaultValue={this.props.month}
                        ref="month"
                        onChange={this.handleChange}>
                        {options}
                    </select>
                    <input
                        className="form-control" 
                        type="text"
                        placeholder="Year"
                        defaultValue={this.props.year}
                        ref="year"
                        onChange={this.handleChange} />
                </form>
            </div>
        );
    }
});

// Create the Container for the entire calendar
var CalendarContainer = React.createClass({
    // Set the state to this month and get the day of the week
    getInitialState: function() {
        var date = new Date();
        date.setDate(1);
        var month = date.getMonth()+1;
        // Get the day of the week
        var startDay = date.getDay()+1;
        var year = date.getFullYear();
        return {
            year: year,
            month: month,
            start: startDay
        };
    },

    // When user input comes in, update the state
    handleUserInput: function(year, month) {
        var startDay = new Date(year, month-1, 1).getDay()+1;
        this.setState({
            year: year,
            month: month,
            start: startDay
        });
    },

    render: function() {
        return (     
            <div
                className="calendar">       
                <SelectDate
                    month={this.state.month}
                    year={this.state.year}
                    onUserInput={this.handleUserInput} />
                <h3>{getMonthName(this.state.month)}</h3>
                <CalendarMonth
                    month={this.state.month}
                    year={this.state.year}
                    start={this.state.start} />
            </div>

        );
    }

});


React.render(<CalendarContainer />, document.body);