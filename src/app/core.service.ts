import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import * as bm from '../assets/bookofmormon.json';
import * as ot from '../assets/oldtestament.json';
import * as nt from '../assets/newtestament.json';
import * as dc from '../assets/doctrineandcovenants.json';
import * as pg from '../assets/pearlofgreatprice.json';

@Injectable()
export class CoreService {
  token;
  selectedInsight:any = {};
  bm:any = bm;
  ot:any = ot;
  nt:any = nt;
  dc:any = dc;
  pg:any = pg;
  constructor(private http: HttpClient, private router:Router) {}

  getScriptures(book,chapter,verses) {
    let displayContent:any = '';
    const foundBook = [...this.ot.books,...this.nt.books,...this.bm.books,...this.dc.books,...this.pg.books].find(bk => {return bk.book === book});
    if(foundBook) {
      displayContent = foundBook.chapters.map(chapter => chapter.verses.map((verse,index) => index + 1 + ' ' + verse.text));
      if(chapter){
        displayContent = [displayContent[+chapter - 1]];
        if(verses){
          const selectedVerses = (verses.includes(',') ? verses.split(',') : [verses]).map(verse =>
            verse.includes('-') ? {verse:verse,startVerse:+verse.split('-')[0],endVerse:+verse.split('-')[1]} : {verse:verse}
          );
          displayContent = [displayContent[0].filter((verse,index) => {
            ++index;
            return selectedVerses.some(verseObject => (index >= verseObject.startVerse && index <= verseObject.endVerse) || +verseObject.verse === index || (verseObject.startVerse && !verseObject.endVerse && index >= verseObject.startVerse));
          })];
        }
      }
    }
    return displayContent;
  }

  createUser(createInfo) {
    return this.http.post('https://1wnjg3qwhl.execute-api.us-west-1.amazonaws.com/PROD/user', createInfo);
  }

  loginUser(createInfo) {
    return this.http.put('https://1wnjg3qwhl.execute-api.us-west-1.amazonaws.com/PROD/user', createInfo);
  }

  getInsights(){
    return this.http.get('https://1wnjg3qwhl.execute-api.us-west-1.amazonaws.com/PROD/insights');
  }

  getTags(){
    return this.http.get('https://1wnjg3qwhl.execute-api.us-west-1.amazonaws.com/PROD/tags');
  }

  createInsight(insight){
    return this.http.post('https://1wnjg3qwhl.execute-api.us-west-1.amazonaws.com/PROD/insights', insight);
  }
  updateInsight(insight) {
    return this.http.put(`https://1wnjg3qwhl.execute-api.us-west-1.amazonaws.com/PROD/insights`, insight);
  }

  getStoryBoards(){
    return this.http.get(`https://1wnjg3qwhl.execute-api.us-west-1.amazonaws.com/PROD/storyboards`);
  }
  deleteStoryBoard(storyboard) {
    this.http.put(`https://1wnjg3qwhl.execute-api.us-west-1.amazonaws.com/PROD/storyboards`, storyboard).subscribe();
  }
  upsertStoryBoard(storyboard) {
    storyboard.connections = storyboard.insights.filter((insight,index) => {
      insight.order = index;
      return insight.connection;
    });
    storyboard.insights = storyboard.insights.filter(insight => insight.insightId);
    return this.http.post(`https://1wnjg3qwhl.execute-api.us-west-1.amazonaws.com/PROD/storyboards`, storyboard).subscribe();
  }
  getSpiderBoards() {
    return this.http.get(`https://1wnjg3qwhl.execute-api.us-west-1.amazonaws.com/PROD/spiderboards`);
  }
  upsertSpiderBoard(spiderboard, lines) {
    return this.http.post(`https://1wnjg3qwhl.execute-api.us-west-1.amazonaws.com/PROD/spiderboards`, Object.assign(spiderboard,{lines:lines}, {spiderboardName:spiderboard.storyboardName})).subscribe();
  }

}
