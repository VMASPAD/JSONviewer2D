// @ts-nocheck
"use client"
import React, { useState } from 'react'
import { Textarea } from "@/components/ui/textarea"
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet"
import { Input } from '@/components/ui/input'
import axios from 'axios';

function JSONData() {
    const [text, setText] = useState('');


    function setLocal(json: string){
        localStorage.setItem("dataJSON",json)
    }
    const handlePaste = async () => {
      try {
        const textFromClipboard = await navigator.clipboard.readText();
        setText(textFromClipboard);
        setLocal(textFromClipboard)
      } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
      }
    };
  
    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(text);
        console.log('Text copied to clipboard');
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    };    
    const handleFormat = () => {
        try {
            const jsonObject = JSON.parse(text);

            const formattedJSON = JSON.stringify(jsonObject, null, 2); // Indentación de 2 espacios

            setText(formattedJSON)
        } catch (err) {
          console.error('Failed to copy text: ', err);
        }
      };

      const handleCompress = () => {
        try {
            const jsonObject = JSON.parse(text);

            const formattedJSON = JSON.stringify(jsonObject); // Indentación de 2 espacios

            setText(formattedJSON)
        } catch (err) {
          console.error('Failed to copy text: ', err);
        }
      }
      const handleClear = () => {
        setText("")
      }
      const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const content = e.target.result;
            setText(content);
            console.log(content)
          };
          reader.readAsText(file);
        }
      };
      const handleSave = () => {
        setLocal(text)
      }
  return (
    <div>
        <nav className='flex flex-row items-center justify-center py-5 gap-5'>
        <Button onClick={handleSave}>Save</Button>
        <Button onClick={handlePaste}>Paste</Button>
        <Button onClick={handleCopy}>Copy</Button>
            <Button onClick={handleFormat}>Format</Button>
            <Button onClick={handleCompress}>Remove White Space</Button>
            <Button onClick={handleClear}>Clear</Button>
            <Sheet>
  <SheetTrigger>
  <Button onClick={handleClear}>Load JSON Data</Button></SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Charge any form JSON data </SheetTitle>
      <SheetDescription>
        <br></br>
        <Input type='file' onChange={handleFileChange}/>
      </SheetDescription>
    </SheetHeader>
  </SheetContent>
</Sheet>

        </nav>
      <Textarea className='h-[50rem]'         value={text }
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text here"/>
    </div>
  )
}

export default JSONData
