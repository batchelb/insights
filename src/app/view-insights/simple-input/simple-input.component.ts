import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-simple-input',
  templateUrl: './simple-input.component.html',
  styleUrls: ['./simple-input.component.less']
})
export class SimpleInputComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<SimpleInputComponent>, @Inject(MAT_DIALOG_DATA) public title: any) { }

  ngOnInit() {
  }

}
