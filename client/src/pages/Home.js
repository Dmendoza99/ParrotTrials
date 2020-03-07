import React, { PureComponent } from "react";
import {
  Container,
  Row,
  Col,
  Input,
  InputGroupAddon,
  InputGroup,
  ButtonGroup,
  Button,
} from "reactstrap";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Label,
  CartesianGrid,
} from "recharts";
import HeaderLayout from "./../layouts/HeaderLayout";
import { codes } from "../currencies";
// const API_ROUTE = "http://localhost:3001";
const API_ROUTE = "http://18.191.218.42:3001";

/**
 * timeLapse
 * 0, es 1 semana
 * 1, es 1 mes
 * 2, es 3 meses
 */
class Home extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      base: 0,
      versus: 0,
      baseTotal: 1,
      versusTotal: 1,
      data: {},
      timeLapse: 0,
    };
  }

  updateGraph = () => {
    const { base, versus, timeLapse } = this.state;
    const startDate = new Date();
    if (timeLapse === 0) {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeLapse === 1) {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (timeLapse === 2) {
      startDate.setMonth(startDate.getMonth() - 3);
    }
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
          data: Object.keys(hist.rates).map(rate => ({
            date: rate,
            rate: hist.rates[rate],
          })),
        });
      });
  };
  render() {
    const { base, versus, versusTotal, baseTotal, data } = this.state;
    const onchangeSelect = async e => {
      await this.setState({ [e.target.name]: e.target.value });
      this.updateGraph();
    };

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

      this.updateGraph();
    };

    return (
      <HeaderLayout>
        <Container className="mainCard">
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
                    onChange={onchangeSelect}
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
                    onChange={onchangeSelect}
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
          <ButtonGroup size="lg" className="buttonGroup">
            <Button
              color="success"
              onClick={async () => {
                await this.setState({ timeLapse: 0 });
                this.updateGraph();
              }}>
              1 Semana
            </Button>
            <Button
              color="success"
              onClick={async () => {
                await this.setState({ timeLapse: 1 });
                this.updateGraph();
              }}>
              1 Mes
            </Button>
            <Button
              color="success"
              onClick={async () => {
                await this.setState({ timeLapse: 2 });
                this.updateGraph();
              }}>
              3 Meses
            </Button>
          </ButtonGroup>
          <Container className="graphContainer">
            <ResponsiveContainer width={"100%"} height={"100%"}>
              <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis dataKey="date">
                  <Label
                    value={`${codes[base]}/${codes[versus]}`}
                    offset={0}
                    position="insideBottom"
                  />
                </XAxis>
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
