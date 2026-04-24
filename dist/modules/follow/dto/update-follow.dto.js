"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateFollowDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_follow_dto_1 = require("./create-follow.dto");
class UpdateFollowDto extends (0, mapped_types_1.PartialType)(create_follow_dto_1.CreateFollowDto) {
}
exports.UpdateFollowDto = UpdateFollowDto;
//# sourceMappingURL=update-follow.dto.js.map