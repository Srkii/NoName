import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QuillConfigService {

  editorModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],  
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],       
      [{ 'size': ['small', false, 'large', 'huge'] }, { 'header': [1, 2, 3,false] }],  
      [{ 'color': [] }],         
      [{ 'align': [] }],
      ['clean']                                 
    ]
  };

  editorFormats = ['bold', 'italic', 'underline', 'strike', 'code-block',
    'header', 'list', 'indent', 'direction', 'size', 'color', 'background', 'font', 'align'];
}
