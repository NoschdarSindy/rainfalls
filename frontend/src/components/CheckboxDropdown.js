import React, { Component } from "react";
import ReactSelect from "react-select";
import { components } from "react-select";
import WindowManager from "./WindowManager";

export class CheckboxDropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: this.props.items,
      nonSelected: [],
    };
  }

  onChange = (selected) => {
    const nonSelected = [];

    this.props.items.forEach((item) => {
      item.isSelected = selected.includes(item);
      if (!item.isSelected) {
        nonSelected.push(item);
      }
    });

    this.setState({
      selected: selected,
      nonSelected: nonSelected,
    });

    WindowManager.setState(selected, nonSelected);
  };

  onFocus = () => {
    const selected = [];
    const nonSelected = [];

    this.props.items.forEach((item) => {
      item.isSelected = WindowManager.isVisible(item.value);
      if (item.isSelected) {
        selected.push(item);
      } else {
        nonSelected.push(item);
      }
    });

    this.setState({
      selected: selected,
      nonSelected: nonSelected,
    });
  };

  close = () => {
    const element = document.getElementById("react-select-2-input");

    if (element) {
      element.blur();
    }
  };

  render() {
    return (
      <span className="d-inline-block header-toolbar">
        <ReactSelect
          id={"view-select-dropdown"}
          className={"header-toolbar"}
          options={this.props.items}
          value={this.state.selected}
          isMulti={true}
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          controlShouldRenderValue={false}
          isClearable={false}
          isSearchable={false}
          placeholder={"View"}
          components={{
            Option: (props) => {
              return (
                <div>
                  <components.Option {...props}>
                    <input
                      type="checkbox"
                      id={`${props.value}-check`}
                      checked={props.isSelected}
                      onChange={() => null}
                    />{" "}
                    <label>{props.label}</label>
                  </components.Option>
                </div>
              );
            },
          }}
          onChange={this.onChange}
          onFocus={this.onFocus}
          onMenuClose={this.close}
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
