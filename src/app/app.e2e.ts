import {browser} from 'protractor';

describe('AppComponent', () => {

  beforeEach(() => {
    browser.get('/');
  });

  it('should have a title', () => {
    browser.getTitle().then((title: string) => {
      const result = 'Angular RPG';
      expect(title).toEqual(result);
    });
  });

  // it('should have header', () => {
  //   let subject = element(by.css('h1')).isPresent();
  //   let result  = true;
  //   expect(subject).toEqual(result);
  // });
  //
  // it('should have <home>', () => {
  //   let subject = element(by.css('app home')).isPresent();
  //   let result  = true;
  //   expect(subject).toEqual(result);
  // });
  //
  // it('should have buttons', () => {
  //   let subject = element(by.css('button')).getText();
  //   let result  = 'Submit Value';
  //   expect(subject).toEqual(result);
  // });

});
