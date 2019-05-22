import React, { Component } from "react";
import { Element } from "react-faux-dom";
import * as d3 from "d3";
import Card from "../Cards/cardData";
import axios from "axios";
import * as stats from "../../utils/stats";
import "./BarChart.css";
import "./styles.css";
import SideBar from "./Sidebar";

class Barchart extends Component {
  state = {
    studentData: null,
    hasError: false,
    overall: true,
    median: true,
    multiple: true,
    men: true,
    poc: true,
    women: true,
    single: true,
    veterans: true
  };

  updateOverall = () => {
    this.setState({ overall: !this.state.overall });
  };

  updateMedian = () => {
    this.setState({ median: !this.state.median });
  };

  updateMultiple = () => {
    this.setState({ multiple: !this.state.multiple });
  };

  updateMen = () => {
    this.setState({ men: !this.state.men });
  };

  updatePOC = () => {
    this.setState({ poc: !this.state.poc });
  };

  updateWomen = () => {
    this.setState({ women: !this.state.women });
  };

  updateSingle = () => {
    this.setState({ single: !this.state.single });
  };

  updateVeterans = () => {
    this.setState({ veterans: !this.state.veterans });
  };

  getLiveData = async () => {
    await axios
      .get(
        "http://graduateportal-dev.tw7ahpynm7.us-east-2.elasticbeanstalk.com/api/graduates/data-visualization"
      )
      .then(resp => {
        this.setState({ studentData: [...resp.data.data] });
      })
      .catch(error => this.setState({ hasError: true, error }));
  };

  componentDidMount = () => {
    this.getLiveData();
  };

  plot(chart, width, height) {
    //console.log(this.state.studentData);

    const studentDataSet = [
      {
        category: "Overall",
        average: stats.avg(this.state.studentData),
        display: this.state.overall
      },
      {
        category: "Median",
        average: stats.calculateMedian(
          this.state.studentData.map(obj =>
            stats.parseCurrency(obj.salarychange)
          )
        ),
        display: this.state.median
      },
      {
        category: "Multiple Classes",
        average: stats.avg(
          this.state.studentData.filter(obj => obj.numberofclasses !== "1")
        ),
        display: this.state.multiple
      },
      {
        category: "Men",
        average: stats.avg(
          this.state.studentData.filter(obj => obj.gender === "Male")
        ),
        display: this.state.men
      },
      {
        category: "POC",
        average: stats.avg(
          this.state.studentData.filter(obj => obj.demographic !== "W")
        ),
        display: this.state.poc
      },
      {
        category: "Women",
        average: stats.avg(
          this.state.studentData.filter(obj => obj.gender === "Female")
        ),
        display: this.state.women
      },
      {
        category: "Single Class",
        average: stats.avg(
          this.state.studentData.filter(obj => obj.numberofclasses === "1")
        ),
        display: this.state.single
      },
      {
        category: "Veterans",
        average: stats.avg(
          this.state.studentData.filter(obj => obj.veteran === "Y")
        ),
        display: this.state.veterans
      }
    ];
    //console.log(studentDataSet);

    //console.log(this.state.studentData);
    const xScale = d3
      .scaleBand()
      .domain(
        studentDataSet
          .filter(function(el) {
            return el.display === true;
          })
          .map(d => d.category)
      )
      .range([0, width]);
    const yScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(
          studentDataSet.filter(function(el) {
            return el.display === true;
          }),
          d => d.average
        )
      ])
      .range([height, 0]);
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    chart
      .selectAll(".bar")
      .data(
        studentDataSet.filter(function(el) {
          return el.display === true;
        })
      )
      .enter()
      .append("rect")
      .classed("bar", true)
      .attr("x", d => xScale(d.category))
      .attr("y", d => yScale(d.average))
      .attr("height", d => height - yScale(d.average))
      .attr("width", d => xScale.bandwidth())
      .style("fill", (d, i) => colorScale(i));

    // chart
    //   .selectAll('.bar-label')
    //   .data(studentDataSet)
    //   .enter()
    //   .append('text')
    //   .classed('bar-label', true)
    //   .attr('x', d => xScale(d.category) + xScale.bandwidth() / 2)
    //   .attr('dx', 0)
    //   .attr('y', d => yScale(d.average))
    //   .attr('dy', -6)
    //   .text(d => d.value);

    const xAxis = d3.axisBottom().scale(xScale);

    chart
      .append("g")
      .classed("x axis", true)
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);

    const yAxis = d3
      .axisLeft()
      .ticks(5)
      .scale(yScale);

    chart
      .append("g")
      .classed("y axis", true)
      .attr("transform", "translate(0,0)")
      .call(yAxis);

    chart
      .select(".x.axis")
      .append("text")
      .attr("x", width / 2)
      .attr("y", 60)
      .attr("fill", "#000")
      .style("font-size", "20px")
      .style("text-anchor", "middle")
      .text("Category");

    chart
      .select(".y.axis")
      .append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("transform", `translate(-50, ${height / 2}) rotate(-90)`)
      .attr("fill", "#000")
      .style("font-size", "20px")
      .style("text-anchor", "middle")
      .text("Average Student Salary Increase");
  }

  drawLegend() {
    const height = 300;
    const width = 300;

    const elLegend = new Element("div");

    const svg = d3
      .select(elLegend)
      .append("svg")
      .attr("id", "legend")
      .attr("width", width)
      .attr("height", height);

    const margin = {
      top: 60,
      bottom: 0,
      left: 60,
      right: 100
    };

    const legend = svg
      .append("g")
      .classed("display", true)
      .attr("transform", `translate(${margin.right},${margin.top})`);

    const legendWidth = width - margin.left - margin.right;
    const legendHeight = height - margin.top - margin.bottom;
    this.plot(legend, legendWidth, legendHeight);

    return elLegend.toReact();
  }

  drawChart() {
    const width = 800;
    const height = 450;

    const el = new Element("div");
    const svg = d3
      .select(el)
      .append("svg")
      .attr("id", "chart")
      .attr("width", width)
      .attr("height", height);

    const margin = {
      top: 60,
      bottom: 100,
      left: 120,
      right: 40
    };

    const chart = svg
      .append("g")
      .classed("display", true)
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    this.plot(chart, chartWidth, chartHeight);

    return el.toReact();
  }

  render() {
    return (
      <div id="Barchart">
        {console.log(this.state)}
        <SideBar
          {...this.state}
          pageWrapId={"page-wrap"}
          outerContainerId={"Barchart"}
          updateParentOverall={this.updateOverall}
          updateParentMedian={this.updateMedian}
          updateParentMen={this.updateMen}
          updateParentMultiple={this.updateMultiple}
          updateParentPOC={this.updatePOC}
          updateParentWomen={this.updateWomen}
          updateParentSingle={this.updateSingle}
          updateParentVeterans={this.updateVeterans}
        />
        <div id="page-wrap" className="center-chart">
          {this.state.studentData && this.drawChart()}

          <Card {...this.state} />
        </div>
      </div>
    );
  }
}

export default Barchart;
