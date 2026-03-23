import { Component, Input } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AngularEditorConfig, AngularEditorModule } from '@kolkov/angular-editor';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ticket-editor',
  imports: [HttpClientModule, AngularEditorModule, CommonModule, FormsModule],
  templateUrl: './ticket-editor.component.html'
})
export class TicketEditorComponent {

  @Input() htmlContent: string = "";
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: 'auto',
    minHeight: '200px',
    placeholder: 'Enter text here...',
    sanitize: true,
    toolbarPosition: 'top',

    enableToolbar: true,
    showToolbar: true,

    toolbarHiddenButtons: [
      [
        'strikeThrough',
        'subscript',
        'superscript',
        'indent',
        'outdent',
        'insertUnorderedList',
        'insertOrderedList',
        'backgroundColor',
        'customClasses',
        'fontName'
      ],
      [
        'fontSize',
        'toggleEditorMode',
        'removeFormat'
      ]
    ]
  };


}
