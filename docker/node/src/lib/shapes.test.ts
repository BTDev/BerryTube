import { expect } from "chai";

import { shape, isShape } from "./shapes";
import { Unwrap } from "./shapes.base";

describe("shapes", function() {
	const StringShape = shape({ kind: "string", default: "" });
	const PasswordShape = shape({ kind: "string", type: "password" });
	const LoginShape = shape({
		kind: "object",
		props: { name: StringShape, password: PasswordShape },
	});

	it("does things", function() {
		const data = { test: 1 };

		expect(1).to.eq(2);
	});
});
