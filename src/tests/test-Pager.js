import React from 'react';
import {expect} from 'chai';
import {mount, shallow} from 'enzyme';
import sinon from 'sinon';
import Pager from '../Pager';
import TEST_STATE from './test_items';
import {isElement} from 'lodash';
import { JSDOM } from 'jsdom';
// setup dom
const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const { window } = jsdom;
global.window = window;
global.document = window.document;
global.navigator = {
	userAgent: 'node.js',
};

class Tester extends React.Component{
	render(){
		let {
			items,
			data,
			page,
			numPages,
			searchText
		} = this.props;

		return (
			<ul>{(items || data).map(i =>
				<li data-id={i.id} key={i.title}>{
					i.title
				}</li>
			)}</ul>
		);

	}
}

describe('<Pager/>', function(){
	var wrapper;
	var testProps = {
		pageSize: 10,
		items: TEST_STATE.items
	};
	var numPages = Math.ceil(
		testProps.items.length / testProps.pageSize
	);

	beforeEach(function(){
		wrapper = mount(
			<Pager {...testProps}>
				<Tester/>
			</Pager>
		)
	})

	describe('pagination functionality', () => {
		it('takes items array as a prop, and segments into pages of a given size, passing only items on current page to children', () => {
			expect(wrapper.find('li [data-id]'))
				.to.have.lengthOf(testProps.pageSize);
			expect(wrapper.find(Tester).props().items.length)
				.to.equal(testProps.pageSize);
		})
		it(`can receive a 'dataProp' property to pass array as a custom prop, instead of 'items'`, () => {
			wrapper = mount(
				<Pager
					{...testProps}
					dataKey="data"
				>
					<Tester/>
				</Pager>
			)
			expect(wrapper.find(Tester).props().data.length)
				.to.equal(testProps.pageSize);

		})
		it(`renders .pagination-link components for each page of items`, () => {
			expect(wrapper.find('.pagination-link'))
				.to.have.lengthOf(numPages)
		})
		it(`injects a new set of items into child component when page changes`, () => {
			let idsP1 = wrapper
				.find('[data-id]')
				.map(
					elem => elem.props()['data-id']
				);
			wrapper.setState({page: 2});
			let idsP2 = wrapper
				.find('[data-id]')
				.map(
					elem => elem.props()['data-id']
				)
			expect(idsP1).to.not.equal(idsP2);
		})
		it(`injects numPages prop into child component`, () => {
			expect(wrapper.find(Tester).props().numPages)
				.to.equal(numPages);
		})
		it(`injects a currentPage prop into child component`, () => {
			expect(wrapper.find(Tester).props().currentPage)
				.to.equal(1);
		})
		it(`navigates to the next page (if it exists) with right arrow key`, () => {
			expect(wrapper.find('.pagination-link').length).to.be.at.least(1);
			wrapper.setState({page: 1});
			expect(wrapper.state().page).to.equal(1);
			wrapper.setState({page: 2});
			expect(wrapper.state().page).to.equal(2);
			wrapper.simulate('keydown', {key: 'ArrowRight'});
			expect(wrapper.state().page).to.equal(3);
			wrapper.setState({page: numPages});
			wrapper.simulate('keydown', {key: 'ArrowRight'});
			expect(wrapper.state().page).to.equal(numPages);
		})
		it(`navigates to previous page (if it exists) with previous arrow key`, () => {
			expect(wrapper.find('.pagination-link').length).to.be.at.least(1);
			wrapper.setState({page: 2});
			wrapper.simulate('keydown', {key: 'ArrowLeft'});
			expect(wrapper.state().page).to.equal(1);
			wrapper.simulate('keydown', {key: 'ArrowLeft'});
			expect(wrapper.state().page).to.equal(1);
		})
	})
	
	describe('search functionality', () => {
		it(`renders a text input element to search items`, () => {
			expect(wrapper.find('input.search-input'))
				.to.have.lengthOf(1);
		})
		it(`when searchText isn't empty, only includes data that includes searchText`, () => {
			let expectedIdx = 3;
			let expected = testProps.items[expectedIdx];
			let searchVal = expected.title;
			expect(wrapper.find('li'))
				.to.have.lengthOf(testProps.pageSize);
			wrapper.setState({searchText: searchVal});
			expect(wrapper.find('li'))
				.to.have.lengthOf(1);
		})

		it(`clears searchText when escape key is pressed`, () => {
			let searchText = "test";
			wrapper.setState({searchText: "test"});
			expect(wrapper.state().searchText).to.equal(searchText);
			wrapper.simulate('keydown', {key: "Escape"});
			expect(wrapper.state().searchText).to.equal("");
		})
		it(`changing value of .search-input updates searchText in state`, () => {
			let searchText = "test";
			wrapper.setState({searchText: ""});
			wrapper.find('.search-input').simulate('change', {
				target: {value: searchText}
			});
			expect(wrapper.state().searchText)
				.to.equal(searchText);
		})
		it(`injects searchText prop into child component`, () => {
			let searchText = "test";
			wrapper.setState({searchText});
			expect(wrapper.find(Tester).props().searchText)
				.to.equal(searchText);
		})
		it(`can accept a search function to use instead of standard search of object keys, receiving the object and searchText as arguments`, () => {
			let searchFunc = sinon.spy();
			let searchText = "test";
			wrapper = mount(
				<Pager {...testProps} searchFunc={searchFunc}>
					<Tester/>
				</Pager>
			);
			wrapper.setState({searchText});
			testProps.items.forEach(i => {
				expect(searchFunc.calledWith(i, searchText)).to.be.true;
			})
		})
		it(`sets focus to search input on mount`, () => {
			let inputLoaded = sinon.spy(Pager.prototype, 'inputLoaded');
			wrapper = mount(
				<Pager {...testProps}>
					<Tester/>
				</Pager>
			)
			expect(inputLoaded.calledOnce)
				.to.be.true;
			expect(isElement(inputLoaded.lastCall.args[0]))
				.to.be.true;
			expect(document.activeElement)
				.to.equal(wrapper.find('.search-input').instance());
		})
	})
})