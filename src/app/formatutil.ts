export class FormatUtil {

    static parseToNumber(quantityStr: string): number {
        var num = Number(quantityStr.replace(/[^0-9.-]+/g,""));
        return num;
    }

    static formatNumber(num: number): string {
        return "$" + num.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }
}