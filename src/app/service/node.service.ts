import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ActionRequest, ActionType} from "../model/node";

@Injectable({
  providedIn: 'root'
})
export class NodeService {
  private readonly baseUrl: string = 'http://localhost:{port}/education';
  private readonly executeAction: string = '/action'

  constructor(private readonly httpClient: HttpClient) {
  }

  stopNode(nodeIndex: number) {
    let url = this.baseUrl.replace('{port}', `${8080 + nodeIndex - 1}`);
    url = url + this.executeAction;
    const request: ActionRequest = {actionType: ActionType.STOP};

    return this.httpClient.post<void>(url, request);
  }
}
