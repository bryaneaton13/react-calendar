/** @jsx React.DOM */
/* https://github.com/reactjs/sublime-react */
var React = require('react');

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
var getMonth = function(month) {
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

var CalendarRow = React.createClass({
    checkDate: function(year, month, day) {
        var d = new Date();
        return (d.getFullYear() === year && d.getMonth()+1 === month && d.getDate() === day );
    },
    render: function() {
        var i,
            days = [],
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
                        today={this.checkDate(this.props.year, this.props.month, day)} />
            );
        }
        return (
            <tr>
                {days}
            </tr>
        );
    }
});

var CalendarMonth = React.createClass({
    render: function() {
        var weeks = [];
        var start = this.props.start
        var blanks = (start-1)%7;
        var max;
        

        weeks.push(
            <CalendarRow 
                key={0} 
                blanks={blanks} 
                month={this.props.month}
                year={this.props.year} />
        );
        for (i=0; i<5; i++) {
            start = (8-blanks)+(7*i);
            max = getMax.call(this.props);
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


var SelectDate = React.createClass({
    getInitialState: function() {
        var date = new Date();
        var month = date.getMonth()+1;
        var year = date.getFullYear();
        return {
            initMonth: month,
            initYear: year
        };
    },
    handleSubmit: function(e) {
        e.preventDefault();
    },
    
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
        for (i=1; i<=12; i++) {
            options.push(<option key={i} value={i}>{getMonth(i)}</option>)
        }
        return (
            <form onSubmit={this.handleSubmit}>
                <select
                    className="form-control" 
                    defaultValue={this.props.month}
                    ref="month"
                    onChange={this.handleChange}>
                    {options}
                </select>
                <input
                    size="4"
                    className="form-control" 
                    type="text"
                    placeholder="Year"
                    defaultValue={this.props.year}
                    ref="year"
                    onChange={this.handleChange}
                />
            </form>
        );
    }
});

var CalendarContainer = React.createClass({
    getInitialState: function() {
        var date = new Date();
        date.setDate(1);
        var month = date.getMonth()+1;
        var startDay = date.getDay()+1;
        var year = date.getFullYear();
        return {
            year: year,
            month: month,
            start: startDay
        };
    },

    handleUserInput: function(year, month) {
        var startDay = new Date(year, month-1, 1).getDay()+1;

        this.setState({
            year: year,
            month: month,
            start: startDay
        });
    },

    render: function() {
        var divStyle = {
            textAlign: "center",
            fontSize: "x-large",
            padding: "5px",
            maxWidth: "700px"
        };
        return (     
            <div
                style={divStyle}>       
                <SelectDate
                    month={this.state.month}
                    year={this.state.year}
                    onUserInput={this.handleUserInput} />
                <h3>{getMonth(this.state.month)}</h3>
                <CalendarMonth
                    month={this.state.month}
                    year={this.state.year}
                    start={this.state.start} />
            </div>

        );
    }

});


var FilterableCalendar = React.createClass({

    render: function() {
        return (
            <div>    
                <CalendarContainer />
            </div>
        );
    }
});

React.render(<FilterableCalendar />, document.body);