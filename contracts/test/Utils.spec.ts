import { expect } from "chai";
import { diffSetsSorted } from "../utils/utils";

describe("Utils", () => {
    it("diffs", () => {
        let superset = ["A", "B", "C", "D", "E"];
        let subset = ["A", "B", "C"];
        let expected = ["D", "E"];
        let result = diffSetsSorted(superset, subset);
        expect(result).to.eql(expected);
    })
    it("diffs case insensitive", () => {
        let superset: string[] = ["a", "b", "C", "d", "E"];
        let subset: string[] = ["A", "B", "C"];
        let expected: string[] = ["d", "E"];
        let result = diffSetsSorted(superset, subset);
        expect(result).to.eql(expected);
    })
    it("diffs gap start", () => {
        let superset: string[] = ["A", "B", "C", "D", "E"];
        let subset: string[] = ["B", "C"];
        let expected: string[] = ["A", "D", "E"];
        let result = diffSetsSorted(superset, subset);
        expect(result).to.eql(expected);
    })
})