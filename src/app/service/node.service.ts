import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ActionRequest, ActionType} from "../model/node";

@Injectable({
  providedIn: 'root'
})
export class NodeService {
  private readonly baseUrl: string = 'http://localhost:{port}/education';
  private readonly executeActionPath: string = '/action'

  constructor(private readonly httpClient: HttpClient) {
  }

  executeAction(nodeIndex: number, actionType: ActionType) {
    let url = this.baseUrl.replace('{port}', `${8080 + nodeIndex - 1}`);
    url = url + this.executeActionPath;
    const request: ActionRequest = {actionType: actionType};

    return this.httpClient.post<void>(url, request);
  }
}
