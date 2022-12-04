import React, { Component } from "react";
import ReactSelect from "react-select";
import { components } from "react-select";

const Option = (props) => {
  return (
    <div>
      <components.Option {...props}>
        <input type="checkbox" checked={true} onChange={() => null} />{" "}
        <label>{props.label}</label>
      </components.Option>
    </div>
  );
};

export class Example extends Component {
  constructor(props) {
    super(props);
    this.state = {
      optionSelected: null,
    };
  }

  handleChange = (selected) => {
    this.setState({
      optionSelected: selected,
    });
  };

  render() {
    return (
      <span className="d-inline-block">
        <ReactSelect
          options={this.props.items}
          isMulti
          closeMenuOnSelect={true}
          hideSelectedOptions={false}
          controlShouldRenderValue={false}
          isClearable={false}
          isSearchable={false}
          placeholder={"View"}
          components={{
            Option,
          }}
          onChange={this.handleChange}
          allowSelectAll={true}
          styles={{
            menu: (base) => ({
              ...base,
              width: "max-content",
              minWidth: "100%",
            }),
          }}
        />
      </span>
    );
  }
}
