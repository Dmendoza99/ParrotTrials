import React, { PureComponent } from "react";
import { Container, Row, Col, Input, InputGroupAddon, InputGroup } from "reactstrap";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import HeaderLayout from "./../layouts/HeaderLayout";
import { codes } from "../currencies";
const API_ROUTE = "http://localhost:3001";

class Home extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      base: 0,
      versus: 0,
      baseTotal: 1,
      versusTotal: 1,
      data: {},
    };
  }

  render() {
    const { base, versus, versusTotal, baseTotal, data } = this.state;
    const onchangeInput = async e => {
      e.preventDefault();
      e.persist();
      await this.setState({ [e.target.name]: e.target.value.replace(/\D/, "") });
      const { base, versus, versusTotal, baseTotal } = this.state;
      if (e.target.name === "baseTotal") {
        fetch(`${API_ROUTE}/latest/${codes[base]}/${codes[versus]}`)
          .then(data => data.json())
          .then(real => {
            this.setState({ versusTotal: (baseTotal * parseFloat(real.rate)).toFixed(2) });
          });
      } else if (e.target.name === "versusTotal") {
        fetch(`${API_ROUTE}/latest/${codes[versus]}/${codes[base]}`)
          .then(data => data.json())
          .then(real => {
            this.setState({ baseTotal: (versusTotal * parseFloat(real.rate)).toFixed(2) });
          });
      }

      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();

      fetch(
        `${API_ROUTE}/historical/${codes[base]}/${
          codes[versus]
        }?start=${startDate
          .toLocaleDateString()
          .replace(/\//g, "-")}&end=${endDate.toLocaleDateString().replace(/\//g, "-")}`
      )
        .then(data => data.json())
        .then(hist => {
          this.setState({
            data: Object.keys(hist.rates).map(rate => ({ date: rate, rate: hist.rates[rate] })),
          });
        });
    };

    return (
      <HeaderLayout>
        <Container className="mainCard">
          <h1>Tarea 1.1</h1>
          <Row>
            <Col xs={6}>
              <InputGroup>
                <Input
                  placeholder={`cantidad en ${codes[base]}`}
                  onChange={onchangeInput}
                  name="baseTotal"
                  value={baseTotal}
                />
                <InputGroupAddon>
                  <Input
                    type="select"
                    defaultValue={0}
                    value={base}
                    onChange={e => {
                      this.setState({ [e.target.name]: e.target.value });
                    }}
                    name="base"
                    id="baseSelect">
                    {codes.map((code, i) => {
                      return <option value={i}>{code}</option>;
                    })}
                  </Input>
                </InputGroupAddon>
              </InputGroup>
            </Col>
            <Col xs={6}>
              <InputGroup>
                <Input
                  placeholder={`cantidad en ${codes[versus]}`}
                  onChange={onchangeInput}
                  name="versusTotal"
                  value={versusTotal}
                />
                <InputGroupAddon>
                  <Input
                    type="select"
                    defaultValue={1}
                    value={versus}
                    onChange={e => {
                      this.setState({ [e.target.name]: e.target.value });
                    }}
                    name="versus"
                    id="versusSelect">
                    {codes.map((code, j) => {
                      return <option value={j}>{code}</option>;
                    })}
                  </Input>
                </InputGroupAddon>
              </InputGroup>
            </Col>
          </Row>
          <br />
          <Container style={{ height: "50%" }}>
            <ResponsiveContainer width={"100%"} height={"100%"}>
              <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                {/* <CartesianGrid stroke="#ccc" strokeDasharray="5 5" /> */}
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="rate" stroke="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </Container>
        </Container>
      </HeaderLayout>
    );
  }
}

export default Home;
