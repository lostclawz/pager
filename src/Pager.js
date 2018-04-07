import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default class Pager extends Component{
	
	static propTypes = {
		page: PropTypes.number,
		items: PropTypes.arrayOf(PropTypes.object),
		searchFunc: PropTypes.func,
		pageSize: PropTypes.number,
		dataKey: PropTypes.string
	};

	static defaultProps = {
		dataKey: 'items'
	}

	constructor(props){
		super(props);
		this.state = {
			searchText: "",
			page: props.page || 1
		};
		this.inputLoaded = this.inputLoaded.bind(this);
	}

	searchKeys(obj, searchText){
		if (searchText === ""){
			return true;
		}
		
		let search = searchText.toString().toLowerCase();
		for (let k in obj){
			let space = obj[k].toString().toLowerCase();
			if (space.indexOf(search) >= 0){
				return true;
			}
		}
		return false;
	}

	onChangePage = (p) => {
		this.setState({page: p});
	}

	keyDown = (e) => {
		let {pageSize, items} = this.props;
		let {searchText, page} = this.state;
		switch (e.key){
			case 'Escape':
				this.setState({searchText: ""});	
			break;
			case 'ArrowRight':
				if (searchText === ""){
					let numPages = Math.ceil(
						items.length / pageSize
					);
					if (page < numPages){
						this.setState({page: page + 1});
					}
				}
			break;
			case 'ArrowLeft':
				if (searchText === ""){
					if (page > 1){
						this.setState({page: page - 1});
					}
				}
			break;
		}
	}

	onSearchChange = (e) => {
		this.setState({
			searchText: e.target.value,
			page: 1
		});	
	}

	inputLoaded(div){
		if (div){
			div.focus();
		}
	}

	getFilteredItems = () => {
		let {
			pageSize,
			searchFunc,
			items
		} = this.props;
		let {searchText, page} = this.state;

		let start = (page - 1) * pageSize;

		let filtered = items.slice();

		if (searchText !== ""){
			filtered = items.filter(i =>
				typeof searchFunc === 'function'
				? searchFunc.call(this, i, searchText)
				: this.searchKeys(i, searchText)
			);
		}

		return {
			items: filtered.slice(start, start + pageSize),
			numPages: Math.ceil(
				filtered.length / pageSize
			)
		}
	}

	render(){
		let {
			pageSize,
			children,
			dataKey
		} = this.props;
		let {searchText, page} = this.state;
		let {items, numPages} = this.getFilteredItems();
		return (
			<div onKeyDown={this.keyDown}>
				<header className="pager-header">
					<input
						onChange={this.onSearchChange}
						className="search-input"
						tabIndex="1"
						value={searchText}
						ref={this.inputLoaded}
					/>
					<div className="pagination">{
						Array(numPages)
						.fill(null)
						.map((p, idx) =>
							<a
								key={idx}
								className={classNames(
									'pagination-link',
									{"active": page == idx + 1}
								)}
								onClick={
									this.onChangePage.bind(null, idx + 1)
								}
							>{
								idx + 1
							}</a>
						)
					}</div>
				</header>
				<div className="results">{
					React.Children.map(
						children,
						c => React.cloneElement(c, {
							[dataKey]: items,
							currentPage: page,
							numPages,
							pageSize,
							searchText
						})
					)
				}</div>
			</div>
		);
	}

}
