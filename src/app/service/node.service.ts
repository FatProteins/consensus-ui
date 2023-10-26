import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ActionRequest, ActionType, GetStateResponse, StepByStepRequest} from "../model/node";

@Injectable({
  providedIn: 'root'
})
export class NodeService {
  private readonly baseUrl: string = 'http://localhost:{port}/education';
  private readonly getStatePath: string = '/get-state'
  private readonly executeActionPath: string = '/action'
  private readonly stepByStepPath: string = '/step-by-step/toggle'
  private readonly nextStepPath: string = '/step-by-step/next-step'

  constructor(private readonly httpClient: HttpClient) {
  }

  getState(nodeIndex: number) {
    let url = this.baseUrl.replace('{port}', `${8080 + nodeIndex - 1}`);
    url = url + this.getStatePath;

    return this.httpClient.get<GetStateResponse>(url);
  }

  executeAction(nodeIndex: number, actionType: ActionType) {
    let url = this.baseUrl.replace('{port}', `${8080 + nodeIndex - 1}`);
    url = url + this.executeActionPath;
    const request: ActionRequest = {actionType: actionType};

    return this.httpClient.post<void>(url, request);
  }

  toggleStepByStep(nodeIndex: number, enableStepByStep: boolean) {
    let url = this.baseUrl.replace('{port}', `${8080 + nodeIndex - 1}`);
    url = url + this.stepByStepPath;
    const request: StepByStepRequest = {enable: enableStepByStep};

    return this.httpClient.post<void>(url, request);
  }

  doNextStep(nodeIndex: number) {
    let url = this.baseUrl.replace('{port}', `${8080 + nodeIndex - 1}`);
    url = url + this.nextStepPath;

    return this.httpClient.post<void>(url, null);
  }
}
