import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {KeyValueDelete, KeyValueGet, KeyValuePair} from "../model/keyvalue";
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class KeyValueService {
  private readonly baseUrl: string = 'http://localhost:{port}/education';
  private readonly putKVPath: string = '/put-kv'
  private readonly deleteKVPath: string = '/delete-kv'

  constructor(private readonly httpClient: HttpClient) {
  }

  public keyValueSubject = new Subject<KeyValueGet>();

  putKeyValue(nodeIndex: number, key: string, value: string) {
    const port = 8080 + nodeIndex - 1;
    let url = this.baseUrl.replace('{port}', `${port}`);
    url = url + this.putKVPath;
    const request: KeyValuePair = {key: key, value: value};

    return this.httpClient.post<void>(url, request);
  }

  deleteKeyValue(nodeIndex: number, key: string) {
    const port = 8080 + nodeIndex - 1;
    let url = this.baseUrl.replace('{port}', `${port}`);
    url = url + this.deleteKVPath;
    const request: KeyValueDelete = {key: key};

    return this.httpClient.post<void>(url, request);
  }
}
