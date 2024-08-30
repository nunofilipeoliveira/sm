import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface UtilizadoresData {
  id: string;
  name: string;
  email: string;
}

export const UtilizadoresData_Table: UtilizadoresData[] = [
  { id: '1',     name: 'Nuno Filipe',         email:'nuno.oliveira@hcmaia.pt' },
];

@Component({
    selector: 'table-cmp',
    templateUrl: 'table.component.html'
})



export class TableComponent implements OnInit{

  constructor(private http: HttpClient) {}

    public tableData1: any[]=[];



    ngOnInit() {
      this.tableData1 = UtilizadoresData_Table;

      this.http.get('http://localhost:8080/api/users/getAll').subscribe((data:any) => {

        console.log("WS response", data);
        this.tableData1=data;

      });

    }

}
