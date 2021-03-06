import React from 'react';
import ReactDOM from 'react-dom';

class ViewControlButton extends React.Component {
    _onClick(e, callback) {
        e.preventDefault();
        e.stopPropagation();
        this.props.onClick && this.props.onClick();
    }

    _onMouseDown(e) {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
    }

    render() {
        return (
            <button
                onMouseDown={this._onMouseDown.bind(this)}
                onClick={this._onClick.bind(this)}>{this.props.label}</button>);
    }
}


/**
 * Controls for the match display.
 */
export default class ViewControls extends React.Component {
    render() {
        return (
            <div id='view-controls'>
                <ViewControlButton label="Reset View" onClick={this.props.resetView} />
                <button
                    onClick={() => this.props.onAutoRotateChange(!this.props.autoRotate)}>{this.props.autoRotate ? 'Disable Rotation' : 'Enable Rotation'}</button>
            </div>);
    }
}; 
