import { BaseId } from '../../../Shared/Domain/Entities/BaseId';
import { BaseTimeStamp } from '../../../Shared/Domain/Entities/BaseTimeStamp';
import { FilePayload } from '../Payloads/FilePayload';

export interface FileDomain extends FilePayload, BaseId, BaseTimeStamp {
  // Additional domain-specific properties can be added here
}
