import React, { PureComponent } from "react";
import {
  Container,
  Row,
  Col,
  Input,
  InputGroupAddon,
  InputGroup,
  Toast,
  ToastHeader,
  ToastBody,
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
const API_ROUTE = "http://localhost:3001";
// const API_ROUTE = "http://18.191.218.42:3001";

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
      baseTotal: 1.0,
      versusTotal: 1.0,
      data: {},
      timeLapse: 0,
      showError: false,
      errorMessage: "",
      showGraphError: false,
      errorGraphMessage: "",
      codeBase: codes[0],
      codeVersus: codes[0],
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
            rate: parseFloat(hist.rates[rate]).toFixed(2),
          })),
        });
      })
      .catch(error => {
        this.setState({ errorGraphMessage: "Hubo un error al actualizar la grafica" });
        this.onShowError("showGraphError");
      });
  };

  onShowError = what => {
    this.setState({ [what]: true }, () => {
      window.setTimeout(() => {
        this.setState({ [what]: false });
      }, 5 * 1000);
    });
  };

  render() {
    const {
      base,
      versus,
      versusTotal,
      baseTotal,
      data,
      codeBase,
      codeVersus,
      timeLapse,
      showError,
      errorMessage,
      errorGraphMessage,
      showGraphError,
    } = this.state;

    const onchangeSelect = async e => {
      e.preventDefault();
      e.persist();
      await this.setState({ [e.target.name]: parseFloat(e.target.value) });
      if (e.target.name === "versus") {
        this.setState({ codeVersus: codes[e.target.value] });
      }
      if (e.target.name === "base") {
        this.setState({ codeBase: codes[e.target.value] });
      }
      const { base, versus, baseTotal } = this.state;
      fetch(`${API_ROUTE}/latest/${codes[base]}/${codes[versus]}`)
        .then(data => data.json())
        .then(real => {
          this.setState({ versusTotal: (baseTotal * parseFloat(real.rate)).toFixed(2) });
        })
        .catch(err => {
          this.setState({ errorMessage: "Hubo un error al calcular la conversion" });
          this.onShowError("showError");
        });
      this.updateGraph();
    };

    const onchangeInput = async e => {
      e.preventDefault();
      e.persist();
      await this.setState({ [e.target.name]: e.target.value.replace(/\D/, "") });
      const { base, versus, versusTotal, baseTotal } = this.state;
      console.log(`${API_ROUTE}/latest/${codes[base]}/${codes[versus]}`);
      if (e.target.name === "baseTotal") {
        fetch(`${API_ROUTE}/latest/${codes[base]}/${codes[versus]}`)
          .then(data => data.json())
          .then(real => {
            this.setState({ versusTotal: (baseTotal * parseFloat(real.rate)).toFixed(2) });
          })
          .catch(err => {
            this.setState({ errorMessage: "Hubo un error al calcular la conversion" });
            this.onShowError("showError");
          });
      } else if (e.target.name === "versusTotal") {
        fetch(`${API_ROUTE}/latest/${codes[versus]}/${codes[base]}`)
          .then(data => data.json())
          .then(real => {
            this.setState({ baseTotal: (versusTotal * parseFloat(real.rate)).toFixed(2) });
          })
          .catch(err => {
            this.setState({ errorMessage: "Hubo un error al calcular la conversion" });
            this.onShowError("showError");
          });
      }
      this.updateGraph();
    };

    return (
      <HeaderLayout>
        <Container className="mainCard">
          <Row xs={6} id="reverseFlow">
            <Col xs={2}>
              <center>
                <img src={`/images/${codeBase}.png`} className="flagIcon" alt="wenas"></img>
              </center>
            </Col>
            <Col xs={4}>
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
          </Row>
          <Row xs={6} id="reverseFlow">
            <Col xs={2}>
              <center>
                <img src={`/images/${codeVersus}.png`} className="flagIcon" alt="wenas"></img>
              </center>
            </Col>
            <Col xs={4}>
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
          <Row xs={6} id="reverseFlow">
            <Col xs={6}>
              <Input
                type="select"
                defaultValue={0}
                value={timeLapse}
                name="timeLapse"
                onChange={async e => {
                  await this.setState({ timeLapse: parseInt(e.target.value) });
                  this.updateGraph();
                }}>
                <option value={0}>1 Semana</option>
                <option value={1}>1 Mes</option>
                <option value={2}>3 Meses</option>
              </Input>
            </Col>
          </Row>
          <Container className="graphContainer">
            <ResponsiveContainer width={"100%"} height={"100%"}>
              <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid stroke="#1a1a1a" strokeDasharray="5 5" />
                <XAxis dataKey="date">
                  <Label
                    value={`${codes[base]}/${codes[versus]}`}
                    offset={0}
                    position="insideBottom"
                  />
                </XAxis>
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="rate" fill="#f0ad4e" stroke="#1a1a1a" />
              </AreaChart>
            </ResponsiveContainer>
            <Toast isOpen={showError}>
              <ToastHeader icon="danger">Error en conversion</ToastHeader>
              <ToastBody>{errorMessage}</ToastBody>
            </Toast>
            <Toast isOpen={showGraphError}>
              <ToastHeader icon="danger">Error en grafica</ToastHeader>
              <ToastBody>{errorGraphMessage}</ToastBody>
            </Toast>
          </Container>
        </Container>
      </HeaderLayout>
    );
  }
}

export default Home;
