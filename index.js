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
    days: {
        "S": ["S","M","T","W","T","F","S"],
        "M": ["Sun","Mon","Tues","Wed","Thur","Fri","Sat"],
        "L": ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
    },

    render: function() {
        var weeks = []; // Put all the CalendarRows in here
        var start = this.props.start
        var blanks = (start-1)%7;
        var max;

        var weekdays = this.days[this.props.size].map(function(d){
            return <th>{d}</th>;
        });
        
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
                       {weekdays}
                    </tr>
                </thead>
                <tbody>{weeks}</tbody>
            </table>
        );
    }
});

// Create fields to change the month view
var SelectDate = React.createClass({

    getInitialState: function() {
        return {
            month: this.props.month,
            year: this.props.year
        }
    },

    componentWillReceiveProps: function(nextProps) {
        this.setState({
            month: nextProps.month,
            year: nextProps.year
        })
    },

    // Stop the form from posting when submitted
    handleSubmit: function(e) {
        e.preventDefault();
    },
    
    // Update the month and year when there is a valid selection
    handleChange: function(event) {
        this.setState({
            month: this.refs.month.getDOMNode().value,
            year: this.refs.year.getDOMNode().value
        });
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
                        value={this.state.month}
                        ref="month"
                        onChange={this.handleChange}>
                        {options}
                    </select>
                    <input
                        className="form-control" 
                        type="text"
                        placeholder="Year"
                        value={this.state.year}
                        ref="year"
                        onChange={this.handleChange} />
                </form>
            </div>
        );
    }
});

// Create the Container for the entire calendar
var CalendarContainer = React.createClass({
    windowSmall: 200,
    windowLarge: 700,

    // Set the state to this month and get the day of the week
    getInitialState: function() {
        var date = new Date();
        date.setDate(1);
        var month = date.getMonth()+1;
        // Get the day of the week
        var startDay = date.getDay()+1;
        var year = date.getFullYear();
        var size = window.innerWidth;
        return {
            year: year,
            month: month,
            start: startDay,
            size: "M"
        };
    },

    getWindowSize: function() {
        if (this.getDOMNode().offsetWidth <= this.windowSmall)
            return "S";
        else if (this.getDOMNode().offsetWidth >= this.windowLarge)
            return "L";
        else 
            return "M";
    },

    handleResize: function(e) {
        if (this.getWindowSize() != this.state.size)
            this.setState({size: this.getWindowSize()});
    },
    componentDidMount: function() {
        window.addEventListener('keydown', this.keypress);
        window.addEventListener('resize', this.handleResize);
        this.setState({size: this.getWindowSize()});
    },

    componentWillUnMount: function() {
        window.removeEventListener('keydown', this.keypress);
        window.removeEventListener('resize', this.handleResize);
    },

    keypress: function (e) {
        if (e.keyCode === 37) {
            this.prevMonth();
        }
        else if (e.keyCode === 39) {
            this.nextMonth();
        }
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

    prevMonth: function() {
        var month = this.state.month-1;
        var year = this.state.year;
        var newState = {};
        if (month < 1) {
            newState.year = year-1;
            month = 12;
        }
        newState.month = month;
        newState.start = new Date(year, month-1, 1).getDay()+1;
        this.setState(newState);
    },
    nextMonth: function() {
        var month = this.state.month+1;
        var year = this.state.year;
        var newState = {};
        if (month > 12) {
            newState.year = year+1;
            month = 1;
        }
        newState.month = month;
        newState.start = new Date(year, month-1, 1).getDay()+1;
        this.setState(newState);
    },

    // Reset the state to today's date
    goToToday: function() {
        this.replaceState(this.getInitialState());
    },

    render: function() {
        var calendarClass = "calendar ";
        calendarClass += (this.state.size === "S") ? "small" : (this.state.size === "L") ? "large" : "medium";

        return (     
            <div
                className={"calendar "+this.state.size}>       
                <SelectDate
                    month={this.state.month}
                    year={this.state.year}
                    onUserInput={this.handleUserInput} />
                <button 
                    onClick={this.prevMonth} 
                    className="btn btn-default">
                        &lt;
                </button>
                <button 
                    onClick={this.goToToday} 
                    className="btn btn-success">
                        Reset
                </button>
                <button 
                    onClick={this.nextMonth} 
                    className="btn btn-default">
                        &gt;
                </button>
                <h3>{getMonthName(this.state.month) + " " + this.state.year}</h3>
                <CalendarMonth
                    size={this.state.size}
                    month={this.state.month}
                    year={this.state.year}
                    start={this.state.start} />
            </div>

        );
    }

});


React.render(<CalendarContainer />, document.body);